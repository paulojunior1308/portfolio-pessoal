import { useState, useEffect } from 'react';
import { Package, ShoppingCart, CreditCard, TrendingUp} from 'lucide-react';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import {  subMonths, startOfMonth, endOfMonth } from 'date-fns';

import type { CartItem } from '../types';
export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    todaySales: 0,
    averageTicket: 0,
    monthlyRevenue: 0,
    topProducts: [] as { name: string; quantity: number; revenue: number; }[],
    paymentMethods: [] as { method: string; value: number; percentage: string; }[],
    comparisons: {
      totalProducts: 0,
      todaySales: 0,
      averageTicket: 0,
      monthlyRevenue: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Get total products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const totalProducts = productsSnapshot.size;

      // Get today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const salesQuery = query(
        collection(db, 'sales'),
        where('createdAt', '>=', today),
        orderBy('createdAt', 'desc')
      );
      
      const salesSnapshot = await getDocs(salesQuery);
      const todaySales = salesSnapshot.docs.reduce((acc, doc) => {
        const sale = doc.data();
        return acc + (sale.total || 0);
      }, 0);

      // Get monthly sales for average ticket and revenue
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlyQuery = query(
        collection(db, 'sales'),
        where('createdAt', '>=', firstDayOfMonth),
        orderBy('createdAt', 'desc')
      );

      const monthlySnapshot = await getDocs(monthlyQuery);
      const monthlySales = monthlySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          items: data.items || [],
          total: data.total || 0,
          paymentMethod: data.paymentMethod || 'cash' // Add this line
        };
      });
      
      const monthlyRevenue = monthlySales.reduce((acc, sale) => acc + (sale.total || 0), 0);
      const averageTicket = monthlySales.length > 0 
        ? monthlyRevenue / monthlySales.length 
        : 0;

      // Get previous month data for comparison
      const prevMonthStart = startOfMonth(subMonths(new Date(), 1));
      const prevMonthEnd = endOfMonth(subMonths(new Date(), 1));
      
      const prevMonthQuery = query(
        collection(db, 'sales'),
        where('createdAt', '>=', prevMonthStart),
        where('createdAt', '<=', prevMonthEnd),
        orderBy('createdAt', 'desc')
      );

      const prevMonthSnapshot = await getDocs(prevMonthQuery);
      const prevMonthSales = prevMonthSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          items: data.items || [],
          total: data.total || 0
        };
      });
      
      const prevMonthRevenue = prevMonthSales.reduce((acc, sale) => acc + (sale.total || 0), 0);
      const prevMonthAvgTicket = prevMonthSales.length > 0 
        ? prevMonthRevenue / prevMonthSales.length 
        : 0;

      // Get previous month's product count
      const prevMonthProductsQuery = query(
        collection(db, 'products'),
        where('createdAt', '<=', prevMonthEnd)
      );
      const prevMonthProductsSnapshot = await getDocs(prevMonthProductsQuery);
      const prevMonthProductCount = prevMonthProductsSnapshot.size;

      // Calculate percentage changes
      const calculatePercentChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const comparisons = {
        totalProducts: calculatePercentChange(totalProducts, prevMonthProductCount),
        todaySales: calculatePercentChange(todaySales, prevMonthSales.length > 0 ? prevMonthSales[0]?.total || 0 : 0),
        averageTicket: calculatePercentChange(averageTicket, prevMonthAvgTicket),
        monthlyRevenue: calculatePercentChange(monthlyRevenue, prevMonthRevenue)
      };

      // Get top products
      const productSales: { [key: string]: { name: string, quantity: number, revenue: number } } = {};
      monthlySales.forEach(sale => {
        (sale.items || []).forEach((item: CartItem) => {
          if (!productSales[item.id]) {
            productSales[item.id] = {
              name: item.name || 'Produto sem nome',
              quantity: 0,
              revenue: 0
            };
          }
          productSales[item.id].quantity += item.cartQuantity || 0;
          productSales[item.id].revenue += (item.price || 0) * (item.cartQuantity || 0);
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);

      // Get payment methods distribution
      const paymentMethods = monthlySales.reduce((acc: { [key: string]: number }, sale) => {
        const method = sale.paymentMethod || 'cash';
        if (!acc[method]) {
          acc[method] = 0;
        }
        acc[method] += sale.total || 0;
        return acc;
      }, {});

      const totalPayments = Object.values(paymentMethods).reduce((a, b) => Number(a) + Number(b), 0);
      const paymentMethodsData = Object.entries(paymentMethods).map(([method, value]) => ({
        method: method === 'credit' ? 'Cartão de Crédito'
          : method === 'debit' ? 'Cartão de Débito'
          : method === 'pix' ? 'PIX'
          : 'Dinheiro',
        value,
        percentage: ((Number(value) / Number(totalPayments)) * 100).toFixed(1)
      }));

      setDashboardData({
        totalProducts,
        todaySales,
        averageTicket,
        monthlyRevenue,
        topProducts,
        paymentMethods: paymentMethodsData,
        comparisons
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    const rounded = Math.round(value * 10) / 10;
    return rounded > 0 ? `+${rounded}%` : `${rounded}%`;
  };

  const stats = [
    {
      title: 'Total de Produtos',
      value: dashboardData.totalProducts.toString(),
      icon: Package,
      change: formatPercentage(dashboardData.comparisons.totalProducts),
      changeType: dashboardData.comparisons.totalProducts >= 0 ? 'increase' : 'decrease',
    },
    {
      title: 'Vendas Hoje',
      value: dashboardData.todaySales.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      icon: ShoppingCart,
      change: formatPercentage(dashboardData.comparisons.todaySales),
      changeType: dashboardData.comparisons.todaySales >= 0 ? 'increase' : 'decrease',
    },
    {
      title: 'Ticket Médio',
      value: dashboardData.averageTicket.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      icon: CreditCard,
      change: formatPercentage(dashboardData.comparisons.averageTicket),
      changeType: dashboardData.comparisons.averageTicket >= 0 ? 'increase' : 'decrease',
    },
    {
      title: 'Faturamento Mensal',
      value: dashboardData.monthlyRevenue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      icon: TrendingUp,
      change: formatPercentage(dashboardData.comparisons.monthlyRevenue),
      changeType: dashboardData.comparisons.monthlyRevenue >= 0 ? 'increase' : 'decrease',
    },
  ];

  return (
    <Layout title="Dashboard">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-acai-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="bg-white rounded-xl shadow-md p-4 md:p-6 transition-transform hover:scale-105"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-quicksand">{stat.title}</p>
                      <p className="text-xl md:text-2xl font-bold text-acai-primary mt-1 font-playfair">
                        {stat.value}
                      </p>
                    </div>
                    <Icon className="h-8 w-8 text-acai-secondary" />
                  </div>
                  <div className="mt-4">
                    <span
                      className={`text-sm ${
                        stat.changeType === 'increase'
                          ? 'text-acai-success'
                          : 'text-red-500'
                      }`}
                    >
                      {stat.change} em relação ao mês anterior
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
              <h2 className="card-title">
                Produtos Mais Vendidos
              </h2>
              <div className="space-y-3 md:space-y-4">
                {dashboardData.topProducts.length > 0 ? (
                  dashboardData.topProducts.map((product) => (
                    <div
                      key={product.name}
                      className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-sm md:text-base">{product.name}</span>
                      <div className="text-right">
                        <span className="block text-xs md:text-sm text-gray-600">
                          {product.quantity} unidades
                        </span>
                        <span className="block text-xs md:text-sm font-medium text-acai-success">
                          {product.revenue.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhum produto vendido no período</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
              <h2 className="card-title">
                Vendas por Método de Pagamento
              </h2>
              <div className="space-y-3 md:space-y-4">
                {dashboardData.paymentMethods.length > 0 ? (
                  dashboardData.paymentMethods.map((payment) => (
                    <div
                      key={payment.method}
                      className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-sm md:text-base">{payment.method}</span>
                      <div className="text-right">
                        <span className="block text-xs md:text-sm font-medium">
                          {Number(payment.value).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                        <span className="block text-xs md:text-sm text-gray-600">
                          {payment.percentage}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhuma venda no período</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}