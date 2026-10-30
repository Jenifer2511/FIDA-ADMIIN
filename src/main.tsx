import React from 'react';
import { createRoot } from 'react-dom/client';
import { AdminSite } from './AdminSite';
import './admin-site.css';
import './typography.css';

const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
if (robots) robots.content = 'noindex,nofollow';
document.title = 'FIDA Studio — Product Management';
createRoot(document.getElementById('root')!).render(<React.StrictMode><AdminSite /></React.StrictMode>);
