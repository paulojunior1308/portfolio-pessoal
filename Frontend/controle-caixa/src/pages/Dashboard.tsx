import { useEffect, useState } from 'react';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Dashboard() {
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

  const fetchData = async () => {
    try {
      // Fetch researchers and projects first
      const [researchersSnapshot, projectsSnapshot] = await Promise.all([
        getDocs(collection(db, 'researchers')),
        getDocs(collection(db, 'projects'))
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      const token = searchParams.get('token');
      
      if (token && projectId) {
        try {
          const isValid = await validateShareToken(projectId, token);
          setIsValidToken(isValid);
          if (isValid) {
            setSelectedProjects([projectId]); // Seleciona automaticamente o projeto quando acessado via token
          }
        } catch (error) {
          console.error('Erro ao validar token:', error);
          setIsValidToken(false);
        }
      } else {
        setIsValidToken(null); // Sem token = acesso normal via autenticação
      }
      setIsLoading(false);
    };

    checkAccess();
  }, [projectId, searchParams]);

  useEffect(() => {
    fetchData();
  }, [selectedResearcher, selectedProjects]);

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

  const handleCategoryClick = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  // Se não há token ou o token é inválido, use a verificação de autenticação normal
  if (!isValidToken && !auth.currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Visualização geral do projeto</p>
          </div>
          {auth.currentUser && (
            <div className="w-full sm:w-auto">
              <ShareProjectLink projectId={projectId || selectedProjects[0] || ''} />
            </div>
          )}
        </div>
        
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesquisador
                </label>
                <select
                  value={selectedResearcher}
                  onChange={(e) => handleResearcherChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projetos
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {projects
                    .filter(project => !selectedResearcher || project.researcherId === selectedResearcher)
                    .map((project) => (
                      <label key={project.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project.id)}
                          onChange={() => handleProjectChange(project.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                        />
                        <span className="ml-3 text-sm text-gray-700">{project.name}</span>
                      </label>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`grid grid-cols-1 ${selectedResearcher && selectedProjects.length > 0 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 mb-8`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Total de Projetos</h3>
              <div className="p-2 bg-primary/10 rounded-lg">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-4">{data.totalProjects}</p>
            <p className="text-sm text-gray-600 mt-2 flex items-center">
              Valor Total: 
              <span className="font-semibold ml-1">
                R$ {data.totalProjectValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
          
          {!selectedResearcher && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Pesquisadores</h3>
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-4">{data.totalResearchers}</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Total de Despesas</h3>
              <div className="p-2 bg-success/10 rounded-lg">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-4">
              R$ {data.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-600 mt-2 flex items-center">
              Saldo Restante: 
              <span className="font-semibold ml-1 text-success">
                R$ {data.remainingBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
        </div>

        {selectedResearcher && selectedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Progressão de Despesas</h2>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={data.expensesByProject}
                      margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#E5E7EB" 
                        vertical={false}
                      />
                      <XAxis 
                        dataKey="data" 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                        stroke="#E5E7EB"
                        axisLine={{ stroke: '#E5E7EB' }}
                        dy={10}
                      />
                      <YAxis 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                        stroke="#E5E7EB"
                        axisLine={{ stroke: '#E5E7EB' }}
                        dx={-10}
                      />
                      <Tooltip 
                        formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                        labelFormatter={(label) => `Data: ${new Date(label).toLocaleDateString('pt-BR')}`}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '0.75rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          padding: '12px 16px',
                          fontSize: '14px'
                        }}
                        itemStyle={{
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: 500
                        }}
                        labelStyle={{
                          color: '#6B7280',
                          fontSize: '12px',
                          fontWeight: 400,
                          marginBottom: '4px'
                        }}
                      />
                      <Legend 
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{
                          paddingBottom: '20px',
                          fontSize: '14px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="valorAcumulado" 
                        name="Despesas Acumuladas" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', r: 4, strokeWidth: 2, stroke: '#FFFFFF' }}
                        activeDot={{ 
                          r: 6, 
                          stroke: '#FFFFFF',
                          strokeWidth: 2,
                          fill: '#3B82F6'
                        }}
                        animationDuration={1500}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="valorTotal" 
                        name="Valor Total do Projeto" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        strokeDasharray="6 4"
                        dot={false}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Despesas por Categoria</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.expensesByCategory}
                          dataKey="valor"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={150}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {data.expensesByCategory.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '0.5rem',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhamento por Categoria</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tl-lg">
                              Categoria
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                              Valor Total
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tr-lg">
                              Percentual
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data.expensesByCategory.map((category, index) => {
                            const percentage = (category.valor / data.totalExpenses * 100).toFixed(2);
                            const isExpanded = expandedCategory === category.name;
                            return (
                              <>
                                <tr 
                                  key={index}
                                  onClick={() => handleCategoryClick(category.name)}
                                  className="cursor-pointer transition-colors hover:bg-gray-50"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                                    <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} inline-block mr-2`}>
                                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </span>
                                    {category.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                    R$ {category.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                    {percentage}%
                                  </td>
                                </tr>
                                {isExpanded && category.details.map((detail, detailIndex) => (
                                  <tr key={`${index}-${detailIndex}`} className="bg-gray-50/50">
                                    <td className="px-6 py-3 text-sm text-gray-600 pl-12">
                                      <div className="font-medium">{detail.name}</div>
                                      {detail.description && (
                                        <p className="text-xs text-gray-500 mt-1">{detail.description}</p>
                                      )}
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                                      R$ {detail.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                                      {detail.date && new Date(detail.date).toLocaleDateString('pt-BR')}
                                    </td>
                                  </tr>
                                ))}
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-gray-600 text-lg">
              Selecione um pesquisador e pelo menos um projeto para visualizar os gráficos detalhados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}