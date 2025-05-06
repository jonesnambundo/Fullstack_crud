import React, { useEffect, useState, useContext } from "react";
import { MyContext } from "../../App";
import { Button, Select, MenuItem, Pagination } from "@mui/material";
import { FiEdit3 } from "react-icons/fi";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { PiFileCsv } from "react-icons/pi";
import { IoMdAdd, IoMdClose } from "react-icons/io";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

export const ProductSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const context = useContext(MyContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setIsHeaderFooterShow(false);

    const fetchSales = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/sales");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSales(data);
        setLoading(false);
      } catch (e) {
        setError(e);
        setLoading(false);
        console.error("Erro ao buscar vendas:", e);
      }
    };

    fetchSales();
  }, [context]);

  const handleAddSale = async (newSaleData) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSaleData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSales([...sales, data.sale]);
      setAddModalOpen(false);
      alert("Venda adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar venda:", error);
      alert("Erro ao adicionar venda. Tente novamente.");
    }
  };

  const handleEditSale = async (id, updatedSaleData) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/sales/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSaleData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSales(sales.map((sale) => (sale.id === id ? data.sale : sale)));
      setEditModalOpen(false);
      alert("Venda atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao editar venda:", error);
      alert("Erro ao editar venda. Tente novamente.");
    }
  };

  const handleRemoveSale = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/sales/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setSales(sales.filter((sale) => sale.id !== id));
      alert("Venda removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover venda:", error);
      alert("Erro ao remover venda. Tente novamente.");
    }
  };

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setViewModalOpen(true);
  };

  const handleEditSaleModal = (sale) => {
    setSelectedSale(sale);
    setEditModalOpen(true);
  };

  const handleAddSaleModal = () => {
    setSelectedSale(null);
    setAddModalOpen(true);
  };

  const handleImportCsv = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".csv";

    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch(
            "http://127.0.0.1:5000/sales/upload_csv",
            {
              method: "POST",
              body: formData,
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              `HTTP error! status: ${response.status}, message: ${
                errorData?.message || "Erro ao importar vendas."
              }`
            );
          }
          const data = await response.json();
          setSales(data.sales); 
          alert("Vendas importadas com sucesso do CSV!");
        } catch (error) {
          console.error("Erro ao importar vendas do CSV:", error);
          alert("Erro ao importar vendas do CSV. Tente novamente.");
        }
      }
    };

    fileInput.click();
  };

  const indexOfLastSale = currentPage * perPage;
  const indexOfFirstSale = indexOfLastSale - perPage;
  const currentSales = sales.slice(indexOfFirstSale, indexOfLastSale);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <>
      <div className="card shadow my-4 border-0 flex-center p-3">
        <div className="flex items-center justify-between">
          <h1 className="font-weight-bold mb-0">Sales</h1>
          <div className="ml-auto flex items-center gap-3">
            <Button className="btn-border btn-sm" onClick={handleImportCsv}>
              <PiFileCsv /> Upload CSV
            </Button>
            <Button className="btn-blue btn-sm" onClick={handleAddSaleModal}>
              <IoMdAdd /> Add Sale
            </Button>
          </div>
        </div>
      </div>

      <div className="card shadow my-4 border-0">
        <div className="table-responsive mb-2">
          <table className="table w-full table-striped text-sm">
            <thead className="thead-light bg-gray-100 text-gray-700">
              <tr>
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">PRODUCT</th>
                <th className="py-2 px-4 text-left">QUANTITY</th>
                <th className="py-2 px-4 text-left">PRICE</th>
                <th className="py-2 px-4 text-left">DATE</th>
                <th className="py-2 px-4 text-left">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="text-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading sales...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="text-center text-red-500 py-4">
                    Error loading sales.
                  </td>
                </tr>
              ) : (
                currentSales.map((sale) => (
                  <tr key={sale.id} className="border-t border-gray-200">
                    <td className="py-3 px-4">{sale.id}</td>
                    <td className="py-3 px-4">{sale.product_name}</td>
                    <td className="py-3 px-4">{sale.quantity}</td>
                    <td className="py-3 px-4">{sale.total_price}</td>
                    <td className="py-3 px-4">{sale.date}</td>
                    <td className="py-3 px-4">
                      <div className="actions flex items-center gap-2">
                        <button
                          className="flex items-center justify-center text-blue-500 hover:text-blue-700"
                          onClick={() => handleEditSaleModal(sale)}
                        >
                          <FiEdit3 />
                        </button>
                        <button
                          className="flex items-center justify-center text-green-500 hover:text-green-700"
                          onClick={() => handleViewSale(sale)}
                        >
                          <MdOutlineRemoveRedEye />
                        </button>
                        <button
                          className="flex items-center justify-center text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveSale(sale.id)}
                        >
                          <MdOutlineDeleteOutline />
                        </button>
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
            <h6 className="mb-0 text-sm text-gray-600">Rows per page</h6>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={perPage}
              onChange={(e) => setPerPage(e.target.value)}
              size="small"
              className="text-gray-700"
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={30}>30</MenuItem>
              <MenuItem value={40}>40</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </div>

          <Pagination
            count={Math.ceil(sales.length / perPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </div>
      </div>
    </>
  );
};
