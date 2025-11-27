import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SocialAccountsPage } from '../pages/SocialAccountsPage';
import { PostsListPage } from '../pages/PostsListPage';
import { PostEditorPage } from '../pages/PostEditorPage';
import { PostPreviewPage } from '../pages/PostPreviewPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Layout } from '../components/Layout';

export const AppRouter: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <SocialAccountsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <PostsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/new"
          element={
            <ProtectedRoute>
              <PostEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/:id/edit"
          element={
            <ProtectedRoute>
              <PostEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/:id/preview"
          element={
            <ProtectedRoute>
              <PostPreviewPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
};
