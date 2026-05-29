import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ItemList from './pages/ItemList';
import ItemForm from './pages/ItemForm';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/foods" replace />} />
            <Route path="/foods"           element={<ItemList type="food" />} />
            <Route path="/foods/new"       element={<ItemForm />} />
            <Route path="/foods/:id/edit"  element={<ItemForm />} />
            <Route path="/drinks"          element={<ItemList type="drink" />} />
            <Route path="/drinks/new"      element={<ItemForm />} />
            <Route path="/drinks/:id/edit" element={<ItemForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
