import { useEffect, useState, useCallback } from 'react';
import { collection, query, getDocs, where, CollectionReference, Query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import { validateShareToken } from '../lib/tokenUtils';
import { ShareProjectLink } from '../components/ShareProjectLink';
import { auth } from '../lib/firebase';

interface Project {
  id: string;
  name: string;
  totalAmount: number;
  researcherId: string;
}

interface Expense {
  id: string;
  projectId: string;
  amount: number;
  category: string;
  name: string;
  date?: string;
  description?: string;
}

interface CategoryExpense {
  name: string;
  valor: number;
  color?: string;
  details: {
    name: string;
    amount: number;
    date?: string;
    description?: string;
  }[];
}

interface TimelineExpense {
  data: string;
  valorAcumulado: number;
  valorTotal: number;
}

interface DashboardData {
  totalProjects: number;
  totalResearchers: number;
  totalExpenses: number;
  totalProjectValue: number;
  remainingBudget: number;
  expensesByProject: TimelineExpense[];
  expensesByCategory: CategoryExpense[];
}

interface Researcher {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface DashboardProps {
  isPublicAccess?: boolean;
}

export default function Dashboard({ isPublicAccess = false }: DashboardProps) {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    totalProjects: 0,
    totalResearchers: 0,
    totalExpenses: 0,
    totalProjectValue: 0,
    remainingBudget: 0,
    expensesByProject: [],
    expensesByCategory: []
  });
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedResearcher, setSelectedResearcher] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const token = searchParams.get('token');

  const fetchData = useCallback(async () => {
    try {
      // Fetch researchers, projects and categories first
      const [researchersSnapshot, projectsSnapshot, categoriesSnapshot] = await Promise.all([
        getDocs(collection(db, 'researchers')),
        getDocs(collection(db, 'projects')),
        getDocs(collection(db, 'categories'))
      ]);

      const researchersData = researchersSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));

      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        totalAmount: doc.data().totalAmount,
        researcherId: doc.data().researcherId
      }));

      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];

      setResearchers(researchersData);
      setProjects(projectsData);

      // Fetch expenses based on filters
      let expensesQuery: CollectionReference | Query = collection(db, 'expenses');
      if (selectedProjects.length > 0) {
        expensesQuery = query(expensesQuery, where('projectId', 'in', selectedProjects));
      }

      const expensesSnapshot = await getDocs(expensesQuery);
      const expenses = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];

      // Calculate total project value and remaining budget
      let totalProjectValue = 0;
      if (selectedProjects.length > 0) {
        totalProjectValue = selectedProjects.reduce((sum, projectId) => {
          const project = projectsData.find(p => p.id === projectId);
          return sum + (project?.totalAmount || 0);
        }, 0);
      } else {
        totalProjectValue = projectsData.reduce((sum, project) => sum + project.totalAmount, 0);
      }

      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const remainingBudget = totalProjectValue - totalExpenses;

      // Organize expenses by date for timeline
      const sortedExpenses = expenses.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
      });

      let accumulatedValue = 0;
      const timelineData = sortedExpenses.reduce<TimelineExpense[]>((acc, expense) => {
        if (!expense.date) return acc;
        
        accumulatedValue += expense.amount;
        const existingDate = acc.find(item => item.data === expense.date);
        
        if (existingDate) {
          existingDate.valorAcumulado = accumulatedValue;
        } else {
          acc.push({
            data: expense.date,
            valorAcumulado: accumulatedValue,
            valorTotal: totalProjectValue
          });
        }
        
        return acc;
      }, []);

      // Ensure we have the total value line complete
      if (timelineData.length > 0) {
        const firstDate = timelineData[0].data;
        const lastDate = timelineData[timelineData.length - 1].data;
        
        // Add starting point if needed
        if (timelineData[0].valorAcumulado > 0) {
          timelineData.unshift({
            data: firstDate,
            valorAcumulado: 0,
            valorTotal: totalProjectValue
          });
        }
        
        // Add end point with total value
        timelineData.push({
          data: lastDate,
          valorAcumulado: accumulatedValue,
          valorTotal: totalProjectValue
        });
      }

      // Calculate expenses by category
      const expensesByCategory = expenses.reduce<CategoryExpense[]>((acc, expense) => {
        const category = expense.category;
        const categoryData = categoriesData.find(c => c.name === category);
        const existing = acc.find(item => item.name === category);
        if (existing) {
          existing.valor += expense.amount;
          existing.details.push({
            name: expense.name || 'Sem nome',
            amount: expense.amount,
            date: expense.date,
            description: expense.description
          });
        } else {
          acc.push({
            name: category,
            valor: expense.amount,
            color: categoryData?.color || '#4A90E2',
            details: [{
              name: expense.name || 'Sem nome',
              amount: expense.amount,
              date: expense.date,
              description: expense.description
            }]
          });
        }
        return acc;
      }, []);

      setData({
        totalProjects: selectedProjects.length || projectsData.length,
        totalResearchers: selectedResearcher ? 1 : researchersData.length,
        totalExpenses,
        totalProjectValue,
        remainingBudget,
        expensesByProject: timelineData,
        expensesByCategory
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, [selectedResearcher, selectedProjects]);

  useEffect(() => {
    const checkAccess = async () => {
      if (token && projectId) {
        try {
          const isValid = await validateShareToken(projectId, token);
          setIsValidToken(isValid);
          if (isValid) {
            setSelectedProjects([projectId]);
          }
        } catch (error) {
          console.error('Erro ao validar token:', error);
          setIsValidToken(false);
        }
      } else {
        setIsValidToken(null);
      }
      setIsLoading(false);
    };

    checkAccess();
  }, [projectId, token]);

  useEffect(() => {
    fetchData();
  }, [selectedResearcher, selectedProjects, fetchData]);

  const handleResearcherChange = (researcherId: string) => {
    setSelectedResearcher(researcherId);
    setSelectedProjects([]);
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      }
      return [...prev, projectId];
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  // Verifica acesso
  if (!isPublicAccess && !auth.currentUser) {
    return <Navigate to="/login" />;
  }

  if (isPublicAccess && !isValidToken) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="space-y-4 p-4 max-w-[1366px] mx-auto min-h-screen">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Visualização geral do projeto</p>
        </div>
        {!isPublicAccess && auth.currentUser && (
          <div className="w-full sm:w-auto">
            <ShareProjectLink projectId={projectId || selectedProjects[0] || ''} />
          </div>
        )}
      </div>

      {/* Filtros - Mostrar apenas se não for acesso público */}
      {!isPublicAccess && (
        <div className="bg-white rounded-lg shadow p-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pesquisador
              </label>
              <select
                value={selectedResearcher}
                onChange={(e) => handleResearcherChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
              >
                <option value="">Todos os pesquisadores</option>
                {researchers.map((researcher) => (
                  <option key={researcher.id} value={researcher.id}>
                    {researcher.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Projetos
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                {projects
                  .filter(project => !selectedResearcher || project.researcherId === selectedResearcher)
                  .map((project) => (
                    <label key={project.id} className="flex items-center p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => handleProjectChange(project.id)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                      />
                      <span className="ml-2 text-sm text-gray-700">{project.name}</span>
                    </label>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">Total de Projetos</h3>
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{data.totalProjects}</p>
          <p className="text-xs text-gray-600 mt-1 flex items-center">
            Valor Total: 
            <span className="font-semibold ml-1">
              R$ {data.totalProjectValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>
        
        {!selectedResearcher && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">Pesquisadores</h3>
              <div className="p-1.5 bg-secondary/10 rounded-lg">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{data.totalResearchers}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">Total de Despesas</h3>
            <div className="p-1.5 bg-success/10 rounded-lg">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            R$ {data.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-600 mt-1 flex items-center">
            Saldo Restante: 
            <span className="font-semibold ml-1 text-success">
              R$ {data.remainingBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>
      </div>

      {selectedResearcher && selectedProjects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Progressão de Despesas</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={data.expensesByProject}
                    margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#E5E7EB" 
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="data" 
                      tick={{ fill: '#6B7280', fontSize: 11 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                      stroke="#E5E7EB"
                      axisLine={{ stroke: '#E5E7EB' }}
                      dy={8}
                    />
                    <YAxis 
                      tick={{ fill: '#6B7280', fontSize: 11 }}
                      tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                      stroke="#E5E7EB"
                      axisLine={{ stroke: '#E5E7EB' }}
                      dx={-8}
                    />
                    <Tooltip 
                      formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                      labelFormatter={(label) => `Data: ${new Date(label).toLocaleDateString('pt-BR')}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
                        padding: '8px 12px',
                        fontSize: '12px'
                      }}
                      itemStyle={{
                        color: '#374151',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                      labelStyle={{
                        color: '#6B7280',
                        fontSize: '11px',
                        fontWeight: 400,
                        marginBottom: '2px'
                      }}
                    />
                    <Legend 
                      verticalAlign="top"
                      height={24}
                      iconType="circle"
                      iconSize={6}
                      wrapperStyle={{
                        paddingBottom: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="valorAcumulado" 
                      name="Despesas Acumuladas" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 3, strokeWidth: 1, stroke: '#FFFFFF' }}
                      activeDot={{ 
                        r: 4, 
                        stroke: '#FFFFFF',
                        strokeWidth: 1,
                        fill: '#3B82F6'
                      }}
                      animationDuration={1000}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="valorTotal" 
                      name="Valor Total do Projeto" 
                      stroke="#10B981" 
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      dot={false}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Despesas por Categoria</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.expensesByCategory}
                      dataKey="valor"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {data.expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                {data.expensesByCategory.map((category, index) => (
                  <div key={category.name} className="mb-2">
                    <div
                      className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
                    >
                      <div className="flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }}
                        />
                        <span>{category.name}</span>
                      </div>
                      <span>R$ {category.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {expandedCategory === category.name && (
                      <div className="pl-4 mt-2">
                        {category.details.map((detail, i) => (
                          <div key={i} className="text-sm py-1">
                            <div className="flex justify-between">
                              <span>{detail.name}</span>
                              <span>R$ {detail.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {detail.description && (
                              <p className="text-gray-500 text-xs mt-0.5">{detail.description}</p>
                            )}
                            {detail.date && (
                              <p className="text-gray-500 text-xs">{new Date(detail.date).toLocaleDateString('pt-BR')}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-gray-600 text-sm">
            Selecione um pesquisador e pelo menos um projeto para visualizar os gráficos detalhados.
          </p>
        </div>
      )}
    </div>
  );
}