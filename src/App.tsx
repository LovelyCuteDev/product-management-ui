import { Route, Routes } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './auth/AuthContext';
import { LoginPage } from './auth/LoginPage';
import { SignupPage } from './auth/SignupPage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { DashboardPage } from './dashboard/DashboardPage';
import { ProductsListPage } from './products/ProductsListPage';
import { ProductDetailPage } from './products/ProductDetailPage';
import { ProductFormPage } from './products/ProductFormPage';
import { AppLayout } from './layout/AppLayout';
import { CartPage } from './cart/CartPage';
import { OrdersListPage } from './orders/OrdersListPage';
import { OrderDetailPage } from './orders/OrderDetailPage';
import { UsersListPage } from './users/UsersListPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsListPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="orders" element={<OrdersListPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="users" element={<UsersListPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
