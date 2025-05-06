# E-commerce API & Dashboard

Este projeto implementa uma API para um sistema de e-commerce com funcionalidades como cadastro de produtos, categorias e vendas, bem como um dashboard para visualização e gerenciamento dos dados. O backend foi desenvolvido com Flask, e o frontend utiliza React.

## Tecnologias Utilizadas

- **Backend**: Flask, Flask-SQLAlchemy, Flask-CORS, pandas, SQLAlchemy
- **Frontend**: React, Material-UI, React Router, Axios
- **Banco de Dados**: SQLite
- **Outras Bibliotecas**: PapaParse (para parsing de CSV), React Icons, React-Redux

## Funcionalidades

### Backend (API)

1. **Produtos**:
   - CRUD de produtos: Criar, Editar, Deletar e Listar produtos.
   - Importação e exportação de produtos via CSV.
   
2. **Categorias**:
   - CRUD de categorias: Criar, Editar, Deletar e Listar categorias.
   
3. **Vendas**:
   - CRUD de vendas: Criar, Editar, Deletar e Listar vendas.
   - Importação e exportação de vendas via CSV.
   - Resumo de vendas por mês, semana ou ano.
   
4. **Endpoints**:
   - `/products`: Para listar, criar, editar e deletar produtos.
   - `/categories`: Para listar e criar categorias.
   - `/sales`: Para listar, criar, editar e deletar vendas.
   - `/sales/summary`: Para obter resumo de vendas.
   - `/sales/upload_csv`: Para upload de vendas via CSV.
   - `/products/upload_csv`: Para upload de produtos via CSV.
   - `/products/download_csv`: Para exportar os produtos para CSV.
   - `/sales/download_csv`: Para exportar as vendas para CSV.

### Frontend (Dashboard)

1. **Dashboard de Vendas**:
   - Visualização das vendas totais e quantidade de produtos vendidos.
   - Gráficos para exibição de vendas e lucro mensal.
     ![Image](https://github.com/user-attachments/assets/df9bc2d9-803c-4d42-b45c-fd5697e5ae36)
 
2. **Lsita de Productos**:
   - Exibição de lista de produtos, com opção de Exportar os produtos , Adicionar produtos, Visualizar Remover e editar.
   - ![Image](https://github.com/user-attachments/assets/8b3a13c5-d6fc-4918-955b-37d8b15a68e4)
  
3. Products Sales
   Premite importar um ficheiro Csv de Sales oou adicionar individualmente.
   Permite acoes como editar , visualizar e remover Para adicionar produtos via CSV , (importar produtos) ou crear individualmente.
   ![Image](https://github.com/user-attachments/assets/b939997c-0747-4fbf-9aa4-095bc494873f)
   
4. **Autenticação**:
   - Páginas de login, cadastro e recuperação de senha.

     ![Image](https://github.com/user-attachments/assets/e859f2b1-e80f-4a70-b39e-f6d1725d9113)

---
## Como Rodar o Projeto
Clonar o repositório do GitHub:

git clone https://github.com/jonesnambundo/Fullstack_crud.git

Entrar na pasta do Frontend:
cd FrontEnd

Instalar as dependências do frontend:
npm i

Iniciar o servidor de desenvolvimento do frontend:
npm run dev

### Backend
Criar um ambiente virtual para o Python:python3 
-m venv venv

Ativar o ambiente virtual:
.\venv\Scripts\activate

Instalar as dependências do backend:
pip install -r requirements.txt

Rodar o servidor do Flask:
python app.py
O servidor estará disponível em http://127.0.0.1:5000/.

### API

- **Criar Produto**:
  Envie uma requisição `POST` para `/products` com um corpo JSON contendo os detalhes do produto.

- **Listar Produtos**:
  Envie uma requisição `GET` para `/products` com parâmetros opcionais de pesquisa, como `query` e `category_id`.

- **Upload de Produtos via CSV**:
  Envie um arquivo CSV para `/products/upload_csv`.

- **Criar Venda**:
  Envie uma requisição `POST` para `/sales` com os dados da venda.

- **Resumo de Vendas**:
  Envie uma requisição `GET` para `/sales/summary` com o parâmetro `group_by` (opções: `month`, `week`, `year`).



