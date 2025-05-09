from flask import Flask, request, jsonify, Response
from flask_sqlalchemy import SQLAlchemy
import pandas as pd
import json
from io import StringIO
from datetime import datetime
import csv
from flask_cors import CORS
import os

app = Flask(__name__)

# Configuração do banco de dados (SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.getcwd(), 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)

# Modelos do banco de dados

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    products = db.relationship('Product', backref='category', lazy=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)  
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    brand = db.Column(db.String(100), nullable=False)

class Sale(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)

    def __init__(self, product_id, quantity, total_price, date):
        self.product_id = product_id
        self.quantity = quantity
        self.total_price = total_price
        self.date = date

with app.app_context():
    db.drop_all()  
    db.create_all()  
    # Inserir categorias fixas (se ainda não existirem)
    if not Category.query.first():
        categorias = [
            (1, "TVs"),
            (2, "Refrigerators"),
            (3, "Laptops"),
            (4, "Microwaves"),
            (5, "Smartphones")
        ]
        for id_, name in categorias:
            db.session.add(Category(id=id_, name=name))
        db.session.commit()
        
    sales_data = pd.read_csv('./sales.csv')  
    for _, row in sales_data.iterrows():
        sale_date = datetime.strptime(row['date'], '%Y-%m-%d')
        new_sale = Sale(
            product_id=row['product_id'],
            quantity=row['quantity'],
            total_price=row['total_price'],
            date=sale_date
        )
        db.session.add(new_sale)
    db.session.commit()

# Função auxiliar para padronizar respostas JSON
def gera_response(status, nome_do_conteudo, conteudo, mensagem=False):
    body = {}
    body[nome_do_conteudo] = conteudo
    if mensagem:
        body["mensagem"] = mensagem
    return Response(json.dumps(body), status=status, mimetype="application/json")

# Endpoints de Categoria
@app.route("/categories", methods=["GET"])
def get_categories():
    categories = Category.query.all()
    return jsonify([{'id': c.id, 'name': c.name} for c in categories])

# Endpoint para criar uma categoria
@app.route("/categories", methods=["POST"])
def create_category():
    data = request.json
    new_cat = Category(name=data['name'])
    db.session.add(new_cat)
    db.session.commit()
    return gera_response(201, "category", {'id': new_cat.id, 'name': new_cat.name}, "Categoria criada")

# Endpoints de Produto
# Criar produto
@app.route("/products", methods=["POST"])
def create_product():
    data = request.json
    new_prod = Product(
        name=data['name'],
        description=data['description'],
        price=data['price'],
        category_id=data['category_id'],
        brand=data.get('brand', '')
    )
    db.session.add(new_prod)
    db.session.commit()
    return gera_response(201, "product", {'id': new_prod.id}, "Produto criado")

# Editar produto
@app.route("/products/<int:id>", methods=["PUT"])
def update_product(id):
    data = request.json
    prod = Product.query.get_or_404(id)
    prod.name = data.get('name', prod.name)
    prod.description = data.get('description', prod.description)
    prod.price = data.get('price', prod.price)
    prod.category_id = data.get('category_id', prod.category_id)
    prod.brand = data.get('brand', prod.brand)
    db.session.commit()
    return gera_response(200, "product", {'id': prod.id}, "Produto atualizado")

# Deletar produto
@app.route("/products/<int:id>", methods=["DELETE"])
def delete_product(id):
    prod = Product.query.get_or_404(id)
    db.session.delete(prod)
    db.session.commit()
    return gera_response(200, "product", {'id': id}, "Produto removido")

# Ver lista de produtos
@app.route("/products", methods=["GET"])
def list_products():
    query = request.args.get('query', '')
    category_id = request.args.get('category_id', type=int)

    products_query = Product.query
    if query:
        products_query = products_query.filter(
            Product.name.ilike(f"%{query}%") |
            Product.description.ilike(f"%{query}%") |
            Product.brand.ilike(f"%{query}%")
        )
    if category_id:
        products_query = products_query.filter_by(category_id=category_id)

    products = products_query.all()

    data = []
    for p in products:
        data.append({
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': p.price,
            'category': getattr(p.category, "name", "Categoria não encontrada"),
            'brand': p.brand
        })
    return jsonify(data)

# Upload de produtos via CSV
@app.route("/products/upload_csv", methods=["POST"])
def upload_products_csv():
    file = request.files['file']
    df = pd.read_csv(file)
    for _, row in df.iterrows():
        new_product = Product(
            name=row['name'],
            description=row['description'],
            price=row['price'],
            category_id=row['category_id'],
            brand=row.get('brand', '')
        )
        db.session.add(new_product)
    db.session.commit()
    return gera_response(201, "products", df.to_dict(orient='records'), "Produtos inseridos via CSV")

@app.route("/", methods=["GET"])
def welcome():
    return "Bem-vindo à API! Tudo está funcionando corretamente."

# Download de produtos para arquivo CSV
@app.route("/products/download_csv", methods=["GET"])
def download_products_csv():
    products = Product.query.all()
    csv_data = StringIO()
    writer = csv.writer(csv_data)
    writer.writerow(['id', 'name', 'description', 'price', 'category_id', 'brand'])
    for p in products:
        writer.writerow([p.id, p.name, p.description, p.price, p.category_id, p.brand])
    csv_data.seek(0)
    return Response(
        csv_data.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=products.csv"}
    )

# Endpoints de Vendas
# Ver lista de vendas
@app.route("/sales", methods=["GET"])
def list_sales():
    query = request.args.get('query', '')
    sales_query = Sale.query

    if query:
        sales_query = sales_query.filter(
            Sale.product_id.ilike(f"%{query}%") |
            Sale.quantity.ilike(f"%{query}%")
        )

    sales = sales_query.all()

    data = []
    for sale in sales:
        product = Product.query.get(sale.product_id)
        data.append({
            'id': sale.id,
            'product_id': sale.product_id,
            'quantity': sale.quantity,
            'total_price': sale.total_price,
            'date': sale.date.strftime('%Y-%m-%d %H:%M:%S')
        })
    return jsonify(data)


# Criar venda
@app.route("/sales", methods=["POST"])
def create_sale():
    data = request.json
    
    try:
        sale_date = datetime.strptime(data['date'], "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return gera_response(400, "sale", {}, "Data inválida. Use o formato AAAA-MM-DD HH:MM:SS.")
    
    new_sale = Sale(
        product_id=data['product_id'],
        quantity=data['quantity'],
        total_price=data['total_price'],
        date=sale_date
    )
    
    db.session.add(new_sale)
    db.session.commit()
    
    product = Product.query.get(new_sale.product_id)

    response_data = {
        "id": new_sale.id,
        "product_id": new_sale.product_id,
        "quantity": new_sale.quantity,
        "total_price": new_sale.total_price,
        "date": new_sale.date.strftime("%Y-%m-%d %H:%M:%S")  # Formata a data para o formato correto
    }
    
    return gera_response(201, "sale", response_data, "Venda criada com sucesso")

# Editar venda
@app.route("/sales/<int:id>", methods=["PUT"])
def update_sale(id):
    data = request.json
    
    sale = Sale.query.get_or_404(id)
    
    if 'date' in data:
        try:
            sale_date = datetime.strptime(data['date'], "%Y-%m-%d %H:%M:%S")
            sale.date = sale_date
        except ValueError:
            return gera_response(400, "sale", {}, "Data inválida. Use o formato AAAA-MM-DD HH:MM:SS.")
   
    sale.product_id = data.get('product_id', sale.product_id)
    sale.quantity = data.get('quantity', sale.quantity)
    sale.total_price = data.get('total_price', sale.total_price)

    # Commit da transação
    db.session.commit()
    
    product = Product.query.get(sale.product_id)
    response_data = {
        "id": sale.id,
        "product_id": sale.product_id,
        "quantity": sale.quantity,
        "total_price": sale.total_price,
        "date": sale.date.strftime("%Y-%m-%d %H:%M:%S")  
    }
    
    return gera_response(200, "sale", response_data, "Venda atualizada com sucesso")

# Deletar venda
@app.route("/sales/<int:id>", methods=["DELETE"])
def delete_sale(id):
    sale = Sale.query.get_or_404(id)
    
    db.session.delete(sale)
    db.session.commit()
    
    return gera_response(200, "sale", {'id': id}, "Venda deletada com sucesso")

# Upload de vendas via CSV
@app.route("/sales/upload_csv", methods=["POST"])
def upload_sales_csv():
    file = request.files['file']
    
    try:
        df = pd.read_csv(file)
    except Exception as e:
        return gera_response(400, "sale", {}, f"Erro ao ler o CSV: {str(e)}")
    

    for _, row in df.iterrows():
        try:
            sale_date = datetime.strptime(row['date'], "%Y-%m-%d")
        except ValueError:
            return gera_response(400, "sale", {}, "Data inválida no CSV. Use o formato AAAA-MM-DD.")
        
        new_sale = Sale(
            product_id=row['product_id'],
            quantity=row['quantity'],
            total_price=row['total_price'],
            date=sale_date
        )
        db.session.add(new_sale)
    db.session.commit()
    
    return gera_response(201, "sales", df.to_dict(orient='records'), "Vendas inseridas via CSV")

# Download de vendas para arquivo CSV
@app.route("/sales/download_csv", methods=["GET"])
def download_sales_csv():
    sales = Sale.query.all()
    csv_data = StringIO()
    writer = csv.writer(csv_data)
    writer.writerow(['id', 'product_id', 'quantity', 'total_price', 'date'])
    for sale in sales:
        writer.writerow([sale.id, sale.product_id, sale.quantity, sale.total_price, sale.date.strftime('%Y-%m-%d %H:%M:%S')])
    csv_data.seek(0)
    return Response(
        csv_data.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=sales.csv"}
    )

# Vendas - Resumo de vendas e lucro por período
@app.route("/sales/summary", methods=["GET"])
def sales_summary():
    group_by = request.args.get('group_by', 'month')  # 'week', 'month', 'year'
    sales = Sale.query.all()
    summary = {}
    for sale in sales:
        if group_by == 'week':
            key = sale.date.strftime('%Y-W%U')
        elif group_by == 'year':
            key = sale.date.strftime('%Y')
        else:
            key = sale.date.strftime('%Y-%m')
        if key not in summary:
            summary[key] = {'quantity': 0, 'profit': 0}
        summary[key]['quantity'] += sale.quantity
        summary[key]['profit'] += sale.total_price
    return jsonify(summary)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
