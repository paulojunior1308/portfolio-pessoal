import emailjs from '@emailjs/browser';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const YOUR_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const YOUR_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const YOUR_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

export const sendQuoteRequest = async (cartItems) => {
  try {
    // Buscar informações do cliente autenticado
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('Usuário não está autenticado');
    }

    // Buscar dados da empresa do cliente no Firestore
    const companyDoc = await getDoc(doc(db, 'companies', userId));
    
    if (!companyDoc.exists()) {
      throw new Error('Dados da empresa não encontrados');
    }

    const companyData = companyDoc.data();

    const itemsList = cartItems.map(item => 
      `<tr>
          <td style="border: 1px solid #ddd; padding: 10px;">${item.name}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${item.brand || 'N/A'}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${item.quantity} ${item.unit || ''}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">R$ ${item.price?.toFixed(2) || '0.00'}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">R$ ${(item.price * item.quantity).toFixed(2) || '0.00'}</td>
      </tr>`
    ).join('');

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Preparar dados para o template do email
    const templateParams = {
      to_email: 'pauloesjr2@gmail.com',
      from_name: companyData.companyName,
      customer_email: companyData.email,
      customer_phone: companyData.phone,
      customer_cnpj: companyData.cnpj,
      items_list: itemsList,
      total_amount: `R$ ${total.toFixed(2)}`,
      message: `Novo pedido de orçamento\n\n` +
        `Empresa: ${companyData.companyName}\n` +
        `CNPJ: ${companyData.cnpj}\n` +
        `Email: ${companyData.email}\n` +
        `Telefone: ${companyData.phone}\n\n` +
        `Itens do Pedido:\n${itemsList}\n` +
        `Valor Total: R$ ${total.toFixed(2)}`
    };

    // Enviar email
    const result = await emailjs.send(
      YOUR_SERVICE_ID, 
      YOUR_TEMPLATE_ID, 
      templateParams, 
      YOUR_PUBLIC_KEY
    );

    if (result.status === 200) {
      return true;
    } else {
      throw new Error('Falha ao enviar email');
    }
  } catch (error) {
    console.error('Erro ao enviar solicitação de orçamento:', error);
    throw error;
  }
};