import { useState, useEffect } from 'react';
import { Calendar, Download } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import type { Sale } from '../types';

const COLORS = ['#4A154B', '#611f5c', '#2D8A39', '#F5E1C8'];

const PERIODS = {
  '7D': 'Últimos 7 dias',
  '30D': 'Últimos 30 dias',
  'MTD': 'Mês atual',
  'LM': 'Mês anterior',
} as const;

type PeriodKey = keyof typeof PERIODS;

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('7D');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [customDateRange, setCustomDateRange] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesByPayment, setSalesByPayment] = useState<{
    method: string;
    value: number;
    percentage: number;
  }[]>([]);
  const [topProducts, setTopProducts] = useState<{
    name: string;
    quantity: number;
    revenue: number;
  }[]>([]);
  const [dailySales, setDailySales] = useState<{
    date: string;
    total: number;
    quantity: number;
  }[]>([]);
  const [salesMetrics, setSalesMetrics] = useState({
    totalSales: 0,
    averageTicket: 0,
    totalItems: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!customDateRange) {
      const today = new Date();
      let start = new Date();
      let end = today;

      switch (selectedPeriod) {
        case '7D':
          start = subDays(today, 6);
          break;
        case '30D':
          start = subDays(today, 29);
          break;
        case 'MTD':
          start = startOfMonth(today);
          break;
        case 'LM':
          start = startOfMonth(subDays(startOfMonth(today), 1));
          end = endOfMonth(subDays(startOfMonth(today), 1));
          break;
      }

      setDateRange({
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd'),
      });
    }
  }, [selectedPeriod, customDateRange]);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      // Fetch sales data
      const salesQuery = query(
        collection(db, 'sales'),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'desc')
      );

      const salesSnapshot = await getDocs(salesQuery);
      const salesData = salesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          items: data.items || []
        };
      }) as Sale[];

      setSales(salesData);

      // Calculate daily sales
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const dailySalesData = days.map(day => {
        const dayStart = new Date(day);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        const daySales = salesData.filter(
          sale => sale.createdAt >= dayStart && sale.createdAt <= dayEnd
        );

        return {
          date: format(day, 'dd/MM', { locale: ptBR }),
          total: daySales.reduce((sum, sale) => sum + (sale.total || 0), 0),
          quantity: daySales.reduce((sum, sale) => 
            sum + sale.items.reduce((itemSum, item) => itemSum + (item.cartQuantity || 0), 0), 0
          ),
        };
      });

      setDailySales(dailySalesData);

      // Calculate sales metrics
      const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const totalItems = salesData.reduce((sum, sale) => 
        sum + sale.items.reduce((itemSum, item) => itemSum + (item.cartQuantity || 0), 0), 0
      );

      setSalesMetrics({
        totalSales: salesData.length,
        averageTicket: salesData.length ? totalRevenue / salesData.length : 0,
        totalItems,
        totalRevenue,
      });

      // Calculate payment methods
      const paymentMethods = salesData.reduce((acc, sale) => {
        const method = sale.paymentMethod || 'cash';
        if (!acc[method]) acc[method] = 0;
        acc[method] += sale.total || 0;
        return acc;
      }, {} as Record<string, number>);

      const totalPayments = Object.values(paymentMethods).reduce((a, b) => a + b, 0);

      const paymentMethodsData = Object.entries(paymentMethods).map(([method, value]) => ({
        method: method === 'credit'
          ? 'Cartão de Crédito'
          : method === 'debit'
          ? 'Cartão de Débito'
          : method === 'pix'
          ? 'PIX'
          : 'Dinheiro',
        value,
        percentage: totalPayments ? (value / totalPayments) * 100 : 0
      }));

      setSalesByPayment(paymentMethodsData);

      // Calculate top products
      const productSales = salesData.reduce((acc, sale) => {
        sale.items.forEach(item => {
          if (!acc[item.id]) {
            acc[item.id] = {
              name: item.name || 'Produto sem nome',
              quantity: 0,
              revenue: 0
            };
          }
          acc[item.id].quantity += item.cartQuantity || 0;
          acc[item.id].revenue += (item.price || 0) * (item.cartQuantity || 0);
        });
        return acc;
      }, {} as Record<string, { name: string; quantity: number; revenue: number }>);

      const topProductsData = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopProducts(topProductsData);

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      // Prepare sales data
      const salesData = sales.map(sale => ({
        'Data': format(sale.createdAt, 'dd/MM/yyyy HH:mm'),
        'Total': sale.total,
        'Método de Pagamento': sale.paymentMethod === 'credit'
          ? 'Cartão de Crédito'
          : sale.paymentMethod === 'debit'
          ? 'Cartão de Débito'
          : sale.paymentMethod === 'pix'
          ? 'PIX'
          : 'Dinheiro',
        'Quantidade de Itens': sale.items.reduce((sum, item) => sum + (item.cartQuantity || 0), 0),
      }));

      // Prepare products data
      const productsData = topProducts.map(product => ({
        'Produto': product.name,
        'Quantidade Vendida': product.quantity,
        'Receita': product.revenue,
      }));

      // Prepare payment methods data
      const paymentData = salesByPayment.map(payment => ({
        'Método': payment.method,
        'Valor': payment.value,
        'Porcentagem': `${payment.percentage.toFixed(1)}%`,
      }));

      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new();

      // Add sheets
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesData), 'Vendas');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productsData), 'Produtos');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(paymentData), 'Métodos de Pagamento');

      // Save file
      XLSX.writeFile(wb, `relatorio-${dateRange.start}-${dateRange.end}.xlsx`);
      toast.success('Relatório exportado com sucesso');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  return (
    <Layout title="Relatórios">
      <div className="space-y-6">
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(PERIODS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedPeriod(key as PeriodKey);
                    setCustomDateRange(false);
                  }}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                    selectedPeriod === key && !customDateRange
                      ? 'bg-acai-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setCustomDateRange(true)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors duration-200 ${
                  customDateRange
                    ? 'bg-acai-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Personalizado
              </button>
            </div>

            {customDateRange && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <span className="text-gray-500">até</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}

            <button
              onClick={exportToExcel}
              disabled={loading || sales.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-acai-primary text-white rounded-lg hover:bg-acai-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-acai-primary"></div>
          </div>
        ) : (
          <>
            {/* Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-sm text-gray-600 font-quicksand">Total de Vendas</h3>
                <p className="text-2xl font-bold text-acai-primary mt-1 font-playfair">
                  {salesMetrics.totalSales}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-sm text-gray-600 font-quicksand">Ticket Médio</h3>
                <p className="text-2xl font-bold text-acai-primary mt-1 font-playfair">
                  {salesMetrics.averageTicket.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-sm text-gray-600 font-quicksand">Itens Vendidos</h3>
                <p className="text-2xl font-bold text-acai-primary mt-1 font-playfair">
                  {salesMetrics.totalItems}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-sm text-gray-600 font-quicksand">Receita Total</h3>
                <p className="text-2xl font-bold text-acai-primary mt-1 font-playfair">
                  {salesMetrics.totalRevenue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vendas Diárias */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-acai-primary mb-6 font-playfair">
                  Vendas Diárias
                </h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailySales}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Valor (R$)"
                        stroke="#4A154B"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Produtos Mais Vendidos */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-acai-primary mb-6 font-playfair">
                  Top 5 Produtos
                </h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" name="Receita (R$)" fill="#4A154B" />
                      <Bar dataKey="quantity" name="Quantidade" fill="#2D8A39" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Métodos de Pagamento */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-acai-primary mb-6 font-playfair">
                  Métodos de Pagamento
                </h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByPayment}
                        dataKey="value"
                        nameKey="method"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ method, percentage }) => `${method} (${percentage.toFixed(1)}%)`}
                      >
                        {salesByPayment.map((entry, index) => (
                          <Cell key={entry.method} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Lista de Vendas */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-acai-primary mb-6 font-playfair">
                  Últimas Vendas
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">
                          Data
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600">
                          Itens
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-semibold text-gray-600">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.slice(0, 5).map((sale) => (
                        <tr key={sale.id} className="border-b border-gray-100">
                          <td className="px-3 py-3 text-sm text-gray-800">
                            {format(sale.createdAt, 'dd/MM/yyyy HH:mm')}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-800">
                            {sale.items.reduce((sum, item) => sum + (item.cartQuantity || 0), 0)}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-800 text-right">
                            {sale.total.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}