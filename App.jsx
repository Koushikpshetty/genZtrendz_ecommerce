import { Route, Routes, useNavigate } from "react-router";
import { useLayoutEffect } from "react";
import { useAppStore } from "./store/auth.store";
import Payment from "./pages/Payment.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/products.jsx";
import SingleProduct from "./pages/SingleProduct.jsx";
import Contact from "./pages/Contact.jsx";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";
import Cart from "./pages/Cart.jsx";
import { me } from "./queries/auth.js";
import { useMutation } from "@tanstack/react-query";
import ManageOrder from "./pages/ManageOrder.jsx";
import Orders from "./pages/Order.jsx";

function App() {
  // get the token and user data from local storage and set to store
  const setTokenUser = useAppStore((state) => state.setTokenUser);
  const token = useAppStore((state) => state.token);
  const setCart = useAppStore((state) => state.setCart);
  const storeUser = useAppStore((state) => state.user);

  const { mutate: getUser } = useMutation({
    mutationFn: (t) => {
      return me(t); // Use login for login
    },
  });

  const route = useNavigate();

  useLayoutEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      setTokenUser({ token, user: JSON.parse(user) });
      getUser(token, {
        onSuccess: (data) => {
          const updatedCart = data.user.cart.map((item) => {
            return {
              ...item.productId,
              quantity: item.quantity,
              size: Array.isArray(item.size) ? "M" : item.size, // Default size if not provided
            };
          });
          setCart(updatedCart);
        },
      });
    } else {
      route("/login");
    }
  }, [setTokenUser]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      {!token && (
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      )}
      <Routes>
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Routes>
        <Route path="/products" exact element={<Products />} />
      </Routes>
      <Routes>
        <Route path="/cart" element={<Cart />} />
      </Routes>
      {token && (
        <Routes>
          <Route path="/payment" element={<Payment />} />
        </Routes>
      )}
      {token && storeUser.isAdmin && (
        <Routes>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      )}
      {token && storeUser.isAdmin && (
        <Routes>
          <Route path="/admin/orders" element={<ManageOrder />} />
        </Routes>
      )}
      {token && !storeUser.isAdmin && (
        <Routes>
          <Route path="/orders" element={<Orders />} />
        </Routes>
      )}
      <Routes>
        <Route path="/products/:productId" element={<SingleProduct />} />
      </Routes>
    </>
  );
}

export default App;
