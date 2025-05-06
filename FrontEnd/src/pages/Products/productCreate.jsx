import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import Button from "@mui/material/Button";

import { MyContext } from "../../App";

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

function handleClick(event) {
  event.preventDefault();
  console.info("You clicked a breadcrumb.");
}

export const ProductCreate = () => {
  const context = useContext(MyContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [id, setId] = useState("");
  const [price, setPrice] = useState("");
  const [category_id, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setIsHeaderFooterShow(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "name":
        setName(value);
        break;
      case "description":
        setDescription(value);
        break;
      case "id":
        setId(value);
        break;
      case "price":
        setPrice(value);
        break;
      case "category_id":
        setCategoryId(value);
        break;
      case "brand":
        setBrand(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");

    const newProduct = {
      id: parseInt(id),
      name,
      description,
      price: parseFloat(price),
      category_id: parseInt(category_id),
      brand,
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(
          errorMessage.message || `HTTP error! status: ${response.status}`
        );
      }

      setSuccessMessage("Produto criado com sucesso!");
      setLoading(false);
      setTimeout(() => {
        navigate("/products");
      }, 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCsvFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleUploadCsv = async () => {
    if (!csvFile) {
      setUploadError("Por favor, selecione um arquivo CSV.");
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccessMessage("");

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/products/upload_csv",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(
          errorMessage.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setUploadSuccessMessage(
        data.message || "Produtos carregados com sucesso do CSV!"
      );
      setUploadLoading(false);
      setCsvFile(null);
    } catch (err) {
      setUploadError(err.message);
      setUploadLoading(false);
    }
  };

  return (
    <>
      <div className="card shadow my-4 border-0 flex-center p-3">
        <h2 className="font-weight-bold text-black/70 mb-4">
          Upload Products from CSV
        </h2>
        <div className="mb-3">
          <input
            type="file"
            className="form-control"
            accept=".csv"
            onChange={handleCsvFileChange}
          />
        </div>
        <Button
          onClick={handleUploadCsv}
          className="btn-blue cursor-pointer"
          disabled={uploadLoading || !csvFile}
        >
          {uploadLoading ? "Uploading..." : "Upload CSV"}
        </Button>
        {uploadError && <p className="mt-3 text-danger">{uploadError}</p>}
        {uploadSuccessMessage && (
          <p className="mt-3 text-success">{uploadSuccessMessage}</p>
        )}
      </div>

      <form className="form w-[100%] mt-4" onSubmit={handleSubmit}>
        <div className="card shadow my-4 border-0 flex-center p-3">
          <h2 className="font-weight-bold text-black/70 mb-4">
            Create Single Product
          </h2>

          <div className="row">
            <div className="col-md-12 col_">
              <h4>Product Name</h4>
              <div className="form-group">
                <input
                  type="text"
                  className="input"
                  name="name"
                  value={name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-12 col_">
              <h4>Product Description</h4>
              <div className="form-group">
                <textarea
                  className="input"
                  name="description"
                  value={description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-3 col_">
              <h4>ID</h4>
              <div className="form-group">
                <input
                  type="number"
                  className="input"
                  name="id"
                  value={id}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-3 col_">
              <h4>Price</h4>
              <div className="form-group">
                <input
                  type="number"
                  className="input"
                  name="price"
                  value={price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-3 col_">
              <h4>Category_ID</h4>
              <div className="form-group">
                <input
                  type="number"
                  className="input"
                  name="category_id"
                  value={category_id}
                  onChange={handleInputChange}
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
                  name="brand"
                  value={brand}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="btn-blue border-t-cyan-400"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Product"}
          </Button>

          {error && <p className="mt-3 text-danger">{error}</p>}
          {successMessage && (
            <p className="mt-3 text-success">{successMessage}</p>
          )}
        </div>
      </form>
    </>
  );
};
