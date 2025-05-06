import React, { useEffect, useState, useContext } from "react";
import Papa from "papaparse";
import DashboardBox from "./components/dashboardBox";
import { FaUserCircle } from "react-icons/fa";
import { IoMdCart } from "react-icons/io";
import { MdShoppingBag } from "react-icons/md";

import { MyContext } from "../../App";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


export const Dashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [chartData, setChartData] = useState([]);

  const context = useContext(MyContext);

  useEffect(() => {
    fetch('./sales.csv')
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const data = result.data;
            setSalesData(data);
            
            const quantity = data.reduce((acc, curr) => acc + Number(curr.quantity), 0);
            const sales = data.reduce((acc, curr) => acc + Number(curr.total_price), 0);
            const revenue = sales; 

            setTotalQuantity(quantity);
            setTotalSales(sales);
            setTotalRevenue(revenue);

            // Prepare chart data
            const monthMap = {};
            result.data.forEach((row) => {
              const date = new Date(row.date);
              const month = date.toLocaleString("default", { month: "short" }); // ex: Jan, Feb

              const quantity = parseInt(row.quantity);
              const profit = parseFloat(row.total_price);

              if (!monthMap[month]) {
                monthMap[month] = { name: month, quantity: 0, profit: 0 };
              }

              monthMap[month].quantity += quantity;
              monthMap[month].profit += profit;
            });

            const formattedData = Object.values(monthMap);
            setChartData(formattedData);
          },
        });
      });
  }, []);
  return (
    <>
      <div className="section">
        <div className="dashboardBoxWrapper d-flex">
          <DashboardBox
            color={["#1da256", "#48d483"]}
            icon={<FaUserCircle />}
            title="Total Sales"
            value={totalSales.toFixed(2)}
            grow={true}
          />
          <DashboardBox
            color={["#c012e2", "#eb64fe"]}
            icon={<IoMdCart />}
            title="Total Quantity"
            value={totalQuantity}
          />
          <DashboardBox
            color={["#2c78e5", "#60aff5"]}
            icon={<MdShoppingBag />}
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
          />
        </div>

        <div className="row mt-4 mb-2">
          <div className="col-md-6">
            <div className="card shadow p-4 border-0">
              <h2 className="mb-4 font-bold">Quantidade Vendida por Mês</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#8884d8" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        
          <div className="col-md-6 mb-4">
            <div className="card shadow p-4 border-0">
              <h2 className="mb-4 font-bold">Lucro por Mês</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#82ca9d"
                    dot={true}
                    name="Lucro"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card shadow p-4 border-0">
              <h2 className="mb-4 font-bold">Quantidade e Lucro Combinados</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  {/* Eixos separados */}
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="quantity"
                    fill="#8884d8"
                    name="Quantidade"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="profit"
                    fill="#82ca9d"
                    name="Lucro"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};
