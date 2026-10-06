import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { PortDetailPage } from './pages/PortDetailPage';
import { ProcedureListPage } from './pages/ProcedureListPage';
import { ProcedureViewPage } from './pages/ProcedureViewPage';
import { WorkflowListPage } from './pages/WorkflowListPage';
import { WorkflowDetailPage } from './pages/WorkflowDetailPage';
import { PortManagementPage } from './pages/admin/PortManagementPage';
import { AgentManagementPage } from './pages/admin/AgentManagementPage';
import { WorkTypeManagementPage } from './pages/admin/WorkTypeManagementPage';
import { RoleManagementPage } from './pages/admin/RoleManagementPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ProcedureBuilderPage } from './pages/admin/ProcedureBuilderPage';
import { CategoryManagementPage } from './pages/admin/CategoryManagementPage';
import { GovAgencyManagementPage } from './pages/admin/GovAgencyManagementPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* App Routes (Public View) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="ports/:portId" element={<PortDetailPage />} />
          <Route path="workflows" element={<WorkflowListPage />} />
          <Route path="workflows/:id" element={<WorkflowDetailPage />} />
          <Route path="procedures" element={<ProcedureListPage />} />
          <Route path="procedures/:id" element={<ProcedureViewPage />} />

          {/* Admin Management Section (Requires Login) */}
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/procedures" replace />} />
            <Route path="procedures" element={<ProcedureListPage />} />
            <Route path="procedures/new" element={<ProcedureBuilderPage />} />
            <Route path="procedures/:id/edit" element={<ProcedureBuilderPage />} />
            <Route path="ports" element={<PortManagementPage />} />
            <Route path="agents" element={<AgentManagementPage />} />
            <Route path="categories" element={<CategoryManagementPage />} />
            <Route path="gov-agencies" element={<GovAgencyManagementPage />} />
            <Route path="work-types" element={<WorkTypeManagementPage />} />
            <Route path="roles" element={<RoleManagementPage />} />
            <Route path="users" element={<UserManagementPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
