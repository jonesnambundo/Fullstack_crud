import * as React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { createContext, useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { Header } from "./components/Header";
import { ProductsList } from "./pages/Products/productsList";
import { ProductCreate } from "./pages/Products/productCreate";
import { ProductSales } from "./pages/Products/productsSales";
import { SignUp } from "./pages/signUp";
import { SignIn } from "./pages/signIn";
import { ForgotPassword } from "./pages/forgotPassword";
import { OtpPage } from "./pages/otp";


const MyContext = createContext();

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [isHeaderFooterShow, setIsHeaderFooterShow] = useState(false);

  const values = {
    isLogin,
    setIsLogin,
    isHeaderFooterShow,
    setIsHeaderFooterShow,
  };

  return (
    <>
      <BrowserRouter>
        <MyContext.Provider value={values}>
          <section className="main flex">
            {isHeaderFooterShow === false && (
              <div className="sidebarWrapper w-[17%]">
                <Sidebar />
              </div>
            )}

            <div className={`content_Right w-[${isHeaderFooterShow === false ? '83%' : '100%'}] ${isHeaderFooterShow === true ? 'padding' : ''}`}>
              {isHeaderFooterShow === false && (
                <>
                  <Header />
                  <div className="space"></div>
                </>
              )}

              <Routes>
                <Route path="/" exact={true} element={<Dashboard />} />
                <Route
                  path="/products/list"
                  exact={true}
                  element={<ProductsList />}
                />
                <Route
                  path="/product/create"
                  exact={true}
                  element={<ProductCreate />}
                />
                <Route
                  path="/product/sales"
                  exact={true}
                  element={<ProductSales />}
                />
             
                <Route path="/signUp" exact={true} element={<SignUp />} />
                <Route path="/signIn" exact={true} element={<SignIn />} />
                <Route path="/forgot-password" exact={true} element={<ForgotPassword />} />
                <Route path="/otp" exact={true} element={<OtpPage />} />
              </Routes>
            </div>
          </section>
        </MyContext.Provider>
      </BrowserRouter>
    </>
  );
}

export default App;
export { MyContext };
