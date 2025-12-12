import React from 'react';
import { Route, HashRouter, Routes } from 'react-router-dom';

import Login from './pages/Login';
import Casestudy from './pages/Casestudy';
import EMSManagement from './pages/EMSManagement';
import HomeView from './pages/HomePageView/HomeView';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
	return (
		<HashRouter>
			<Routes>
			{/* <Route path="/" element={<Home />} /> */}
				<Route path="/" element={<HomeView />} />
				<Route path="/login" element={<Login />} />
				<Route 
					path="/homeview" 
					element={
						<ProtectedRoute>
							<HomeView />
						</ProtectedRoute>
					} 
				/>
				<Route 
					path="/casestudy" 
					element={
						<ProtectedRoute>
							<Casestudy />
						</ProtectedRoute>
					} 
				/>
				<Route 
					path="/emsmanagement" 
					element={
						<ProtectedRoute>
							<EMSManagement />
						</ProtectedRoute>
					} 
				/>
			</Routes>
		</HashRouter>
	);
}
