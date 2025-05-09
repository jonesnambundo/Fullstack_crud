import React, { useEffect, useState, useContext } from "react";
import { SearchBox } from "../../components/SearchBox";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import TooltipBox from "@mui/material/Tooltip";
import Pagination from "@mui/material/Pagination";
import { FiEdit3 } from "react-icons/fi";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { MdOutlineDeleteOutline } from "react-icons/md";
import Button from "@mui/material/Button";
import { PiExport } from "react-icons/pi";
import { IoMdAdd } from "react-icons/io";
import Checkbox from "@mui/material/Checkbox";
import { Link } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import { IoMdClose } from "react-icons/io";
import { MyContext } from "../../App";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

export const ProductsList = () => {
  const [perPage, setPerPage] = useState(10);
  const [showBy, setShowBy] = useState(10);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const context = useContext(MyContext);

  const [open, setOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleChange = (event) => {
    setPerPage(event.target.value);
  };

  const selectAll = (e) => {
    setIsAllChecked(e.target.checked);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setIsHeaderFooterShow(false);

    const fetchProducts = async () => {
      try {
        const response = await fetch("https://api-ap.onrender.com/products");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (e) {
        setError(e);
        setLoading(false);
        console.error("Erro ao buscar produtos:", e);
      }
    };

    fetchProducts();
  }, []);

  const toggleDrawer = (newOpen) => {
    setOpen(newOpen);
  };

  const handleExport = () => {
    fetch("https://api-ap.onrender.com/products/download_csv")
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "products.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Erro ao exportar CSV:", error);
      });
  };

  const handleAddProduct = async (newProductData) => {
    try {
      const response = await fetch("https://api-ap.onrender.com/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProductData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts([...products, data.product]);

      setAddModalOpen(false);
      alert("Produto adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      alert("Erro ao adicionar produto. Tente novamente.");
    }
  };

  const handleEditProduct = async (id, updatedProductData) => {
    try {
      const response = await fetch(
        `https://api-ap.onrender.com/products/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedProductData),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(
        products.map((product) => (product.id === id ? data.product : product))
      );
      setEditModalOpen(false);
      alert("Produto atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao editar produto:", error);
      alert("Erro ao editar produto. Tente novamente.");
    }
  };

  const handleRemoveProduct = async (id) => {
    try {
      const response = await fetch(
        `https://api-ap.onrender.com/products/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setProducts(products.filter((product) => product.id !== id));
      alert("Produto removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      alert("Erro ao remover produto. Tente novamente.");
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
  };

  const handleEditProductModal = (product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleAddProductModal = () => {
    setSelectedProduct(null);
    setAddModalOpen(true);
  };

  const indexOfLastProduct = currentPage * perPage;
  const indexOfFirstProduct = indexOfLastProduct - perPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const validateProductData = (data) => {
    if (!data.name || !data.description || !data.price || !data.category_id) {
      alert("Todos os campos são obrigatórios!");
      return false;
    }
    if (isNaN(data.price) || data.price <= 0) {
      alert("O preço deve ser um número positivo!");
      return false;
    }
    return true;
  };

  return (
    <>
      <div className="card shadow my-4 border-0 flex-center p-3">
        <div className="flex items-center justify-between">
          <h1 className="font-weight-bold mb-0">Products</h1>

          <div className="ml-auto flex items-center gap-3">
            <Button className="btn-border btn-sm" onClick={handleExport}>
              <PiExport /> Export
            </Button>
            <Button className="btn-blue btn-sm" onClick={handleAddProductModal}>
              <IoMdAdd /> Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="card shadow my-4 border-0">
        <div className="flex items-center mb-4 justify-between pt-3 px-4">
          <h2 className="mb-0 font-bold text-md">Best Selling Products</h2>
        </div>

        <div className="table-responsive mb-2">
          <table className="table w-full table-striped">
            <thead className="bg-slate-200 text-gray-700">
              <tr>
                <th>
                  <Checkbox {...label} size="small" onChange={selectAll} />
                </th>
                <th>ID</th>
                <th>NAME</th>
                <th>DESCRIPTION</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center text-gray-500">
                    Carregando produtos...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="text-center text-red-500">
                    Erro ao carregar os produtos.
                  </td>
                </tr>
              ) : (
                currentProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50"
                    } hover:bg-slate-200 transition-all duration-300 border-b`}
                  >
                    <td className="px-4 py-2">
                      <Checkbox
                        {...label}
                        size="small"
                        checked={isAllChecked}
                      />
                    </td>
                    <td className="text-sm text-gray-700 px-4 py-2">
                      {product.id}
                    </td>
                    <td className="text-sm text-gray-700 px-4 py-2">
                      {product.name}
                    </td>
                    <td className="text-sm text-gray-700 px-4 py-2">
                      {product.description}
                    </td>
                    <td className="text-sm text-gray-700 px-4 py-2">
                      {product.price}
                    </td>
                    <td className="text-sm text-gray-700 px-4 py-2">
                      {product.category}
                    </td>
                    <td className="text-sm text-gray-700 px-4 py-2">
                      {product.brand}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <TooltipBox title="Edit" placement="top">
                          <button
                            className="flex items-center justify-center w-[30px] h-[30px] rounded-md hover:bg-blue-500 hover:text-white p-1 transition-all duration-300"
                            onClick={() => handleEditProductModal(product)}
                          >
                            <FiEdit3 />
                          </button>
                        </TooltipBox>

                        <TooltipBox title="View" placement="top">
                          <button
                            className="flex items-center justify-center w-[30px] h-[30px] rounded-md hover:bg-green-500 hover:text-white p-1 transition-all duration-300"
                            onClick={() => handleViewProduct(product)} // Abre o modal de visualização
                          >
                            <MdOutlineRemoveRedEye />
                          </button>
                        </TooltipBox>

                        <TooltipBox title="Remove" placement="top">
                          <button
                            className="flex items-center justify-center w-[30px] h-[30px] rounded-md hover:bg-red-500 hover:text-white p-1 transition-all duration-300"
                            onClick={() => handleRemoveProduct(product.id)}
                          >
                            <MdOutlineDeleteOutline />
                          </button>
                        </TooltipBox>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer flex items-center justify-between py-2 px-3 mb-2">
          <div className="flex items-center gap-3">
            <h6 className="mb-0 text-sm">Rows per page</h6>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={perPage}
              onChange={handleChange}
              size="small"
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={30}>30</MenuItem>
              <MenuItem value={40}>40</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </div>

          <Pagination
            count={Math.ceil(products.length / perPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            className="ml-auto"
          />
        </div>
      </div>

      <Drawer
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        anchor={"right"}
        className="sidepanel"
      >
        <form
          className="form w-[100%] mt-4 relative"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = {
              name: e.target.productName.value,
              description: e.target.productDescription.value,
              price: parseFloat(e.target.productPrice.value),
              category_id: parseInt(e.target.productCategoryId.value),
              brand: e.target.productBrand.value,
            };
            handleAddProduct(formData);
          }}
        >
          <Button className="close_" onClick={() => setAddModalOpen(false)}>
            <IoMdClose />
          </Button>

          <div className="card shadow border-0 flex-center p-3">
            <h2 className="font-weight-bold text-black/70 mb-4">
              Add New Product
            </h2>

            <div className="row">
              <div className="col-md-12 col_">
                <h4>Product Name</h4>
                <div className="form-group">
                  <input
                    type="text"
                    className="input"
                    name="productName"
                    defaultValue={selectedProduct ? selectedProduct.name : ""}
                    required
                  />
                </div>
              </div>

              <div className="col-md-12 col_">
                <h4>Product Description</h4>
                <div className="form-group">
                  <textarea
                    className="input"
                    name="productDescription"
                    defaultValue={
                      selectedProduct ? selectedProduct.description : ""
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 col_">
                <h4>Price</h4>
                <div className="form-group">
                  <input
                    type="number"
                    className="input"
                    name="productPrice"
                    required
                  />
                </div>
              </div>
              <div className="col-md-4 col_">
                <h4>Category ID</h4>
                <div className="form-group">
                  <input
                    type="number"
                    className="input"
                    name="productCategoryId"
                    required
                  />
                </div>
              </div>
              <div className="col-md-4 col_">
                <h4>Brand</h4>
                <div className="form-group">
                  <input type="text" className="input" name="productBrand" />
                </div>
              </div>
            </div>
            <Button type="submit" className="btn-blue btn-lg">
              Add Product
            </Button>
          </div>
        </form>
      </Drawer>

      <Drawer
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        anchor={"right"}
        className="sidepanel"
      >
        <div className="form w-[100%] mt-4 relative">
          <Button className="close_" onClick={() => setViewModalOpen(false)}>
            <IoMdClose />
          </Button>

          <div className="card shadow-lg border-0 p-6 max-w-3xl mx-auto bg-white rounded-lg">
            <h2 className="font-semibold text-2xl text-gray-800 mb-6 text-center">
              View Product
            </h2>

            {selectedProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="col-span-1 flex justify-center items-center">
                  <div className="w-full h-64 bg-gray-200 flex justify-center items-center rounded-lg overflow-hidden">
                    {selectedProduct.image ? (
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-xl">
                        No Image Available
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-1">
                  <div className="mb-4">
                    <p className="text-gray-800">
                      Product Name: {selectedProduct.name}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-800">
                      Product Description: {selectedProduct.description}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-800">
                      Price: {selectedProduct.price}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-800">
                      Category: {selectedProduct.category_id}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-800">
                      Brand: {selectedProduct.brand}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Drawer>

     <Drawer
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        anchor={"right"}
        className="sidepanel"
      >
        <form
          className="form w-[100%] mt-4 relative"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = {
              name: e.target.productName.value,
              description: e.target.productDescription.value,
              price: parseFloat(e.target.productPrice.value),
              category_id: parseInt(e.target.productCategoryId.value),
              brand: e.target.productBrand.value,
            };
            if (selectedProduct) {
              handleEditProduct(selectedProduct.id, formData);
            }
          }}
        >
          <Button className="close_" onClick={() => setEditModalOpen(false)}>
            <IoMdClose />
          </Button>

          <div className="card shadow border-0 flex-center p-3">
            <h2 className="font-weight-bold text-black/70 mb-4">
              Edit Product
            </h2>

            <div className="row">
              <div className="col-md-12 col_">
                <h4>Product Name</h4>
                <div className="form-group">
                  <input
                    type="text"
                    className="input"
                    name="productName"
                    defaultValue={selectedProduct ? selectedProduct.name : ""}
                    required
                  />
                </div>
              </div>

              <div className="col-md-12 col_">
                <h4>Product Description</h4>
                <div className="form-group">
                  <textarea
                    className="input"
                    name="productDescription"
                    defaultValue={
                      selectedProduct ? selectedProduct.description : ""
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-3 col_">
                <h4>Price</h4>
                <div className="form-group">
                  <input
                    type="number"
                    className="input"
                    name="productPrice"
                    defaultValue={selectedProduct ? selectedProduct.price : ""}
                    required
                  />
                </div>
              </div>
              <div className="col-md-3 col_">
                <h4>Category ID</h4>
                <div className="form-group">
                  <input
                    type="number"
                    className="input"
                    name="productCategoryId"
                    defaultValue={
                      selectedProduct ? selectedProduct.category_id : ""
                    }
                    required
                  />
                </div>
              </div>
              <div className="col-md-3 col_">
                <h4>Brand</h4>
                <div className="form-group">
                  <input
                    type="text"
                    className="input"
                    name="productBrand"
                    defaultValue={selectedProduct ? selectedProduct.brand : ""}
                  />
                </div>
              </div>
            </div>
            <Button type="submit" className="btn-blue btn-lg">
              Edit Product
            </Button>
          </div>
        </form>
      </Drawer>
    </>
  );
};
