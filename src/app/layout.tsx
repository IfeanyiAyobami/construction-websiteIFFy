import type { Metadata } from 'next';

import './globals.css';
import './refresh.css';
import ScrollToTop from '../components/ScrollToTop';
import ButtonFeedback from '../components/ButtonFeedback';


export const metadata: Metadata = { icons:{icon:[
  {url:'/brand/ka-monogram-black.svg',type:'image/svg+xml',media:'(prefers-color-scheme: light)'},
  {url:'/brand/ka-monogram-white.svg',type:'image/svg+xml',media:'(prefers-color-scheme: dark)'},
]}, title:'Konsadem Associates | Engineering Consultants in Nigeria', description:'Konsadem Associates Limited: engineers and consultants since 1972. Water, infrastructure and environmental engineering across Nigeria.' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body >{children}<ButtonFeedback/><ScrollToTop/></body></html>}
