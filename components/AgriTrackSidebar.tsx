'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AgriTrackSidebar() {
  const pathname = usePathname()
  
  const isActive = (path: string) => pathname.includes(path)
  
  return (
    <aside className="layout-content-container flex flex-col w-64 bg-white shadow-md rounded-xl p-4">
      <div className="flex flex-col gap-6">
        <h1 className="text-[var(--text-primary)] text-2xl font-bold leading-normal px-3 py-2">AgriTrack</h1>
        <nav className="flex flex-col gap-2">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--secondary-color)] transition-colors duration-200"
          >
            <div className="icon-secondary" data-icon="House" data-size="24px" data-weight="regular">
              <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                <path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"></path>
              </svg>
            </div>
            <p className="text-[var(--text-secondary)] text-sm font-medium leading-normal">Dashboard</p>
          </Link>
          
          <Link 
            href="/gallery" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--secondary-color)] transition-colors duration-200"
          >
            <div className="icon-secondary" data-icon="Horse" data-size="24px" data-weight="regular">
              <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                <path d="M136,100a12,12,0,1,1-12-12A12,12,0,0,1,136,100Zm96,29.48A104.29,104.29,0,0,1,130.1,232l-2.17,0a103.32,103.32,0,0,1-69.26-26A8,8,0,1,1,69.34,194a84.71,84.71,0,0,0,20.1,13.37L116,170.84c-22.78-9.83-47.47-5.65-61.4-3.29A31.84,31.84,0,0,1,23.3,154.72l-.3-.43-13.78-22a8,8,0,0,1,2.59-11.05L112,59.53V32a8,8,0,0,1,8-8h8A104,104,0,0,1,232,129.48Zm-16-.22A88,88,0,0,0,128,40V64a8,8,0,0,1-3.81,6.81L27.06,130.59l9.36,15A15.92,15.92,0,0,0,52,151.77c16-2.7,48.77-8.24,78.07,8.18A40.06,40.06,0,0,0,168,120a8,8,0,0,1,16,0,56.07,56.07,0,0,1-51.8,55.83l-27.11,37.28A90.89,90.89,0,0,0,129.78,216,88.29,88.29,0,0,0,216,129.26Z"></path>
              </svg>
            </div>
            <p className="text-[var(--text-secondary)] text-sm font-medium leading-normal">Livestock</p>
          </Link>
          
          <Link 
            href="/logs" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--secondary-color)] transition-colors duration-200"
          >
            <div className="icon-secondary" data-icon="Plant" data-size="24px" data-weight="regular">
              <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                <path d="M247.63,39.89a8,8,0,0,0-7.52-7.52c-51.76-3-93.32,12.74-111.18,42.22-11.8,19.49-11.78,43.16-.16,65.74a71.34,71.34,0,0,0-14.17,27L98.33,151c7.82-16.33,7.52-33.35-1-47.49-13.2-21.79-43.67-33.47-81.5-31.25a8,8,0,0,0-7.52,7.52c-2.23,37.83,9.46,68.3,31.25,81.5A45.82,45.82,0,0,0,63.44,168,54.58,54.58,0,0,0,87,162.33l25,25V216a8,8,0,0,0,16,0V186.51a55.61,55.61,0,0,1,12.27-35,73.91,73.91,0,0,0,33.31,8.4,60.9,60.9,0,0,0,31.83-8.86C234.89,133.21,250.67,91.65,247.63,39.89ZM47.81,147.6C32.47,138.31,23.79,116.32,24,88c28.32-.24,50.31,8.47,59.6,23.81,4.85,8,5.64,17.33,2.46,26.94L61.65,114.34a8,8,0,0,0-11.31,11.31l24.41,24.41C65.14,153.24,55.82,152.45,47.81,147.6Zm149.31-10.22c-13.4,8.11-29.15,8.73-45.15,2l53.69-53.7a8,8,0,0,0-11.31-11.31L140.65,128c-6.76-16-6.15-31.76,2-45.15,13.94-23,47-35.82,89.33-34.83C232.94,90.34,220.14,123.44,197.12,137.38Z"></path>
              </svg>
            </div>
            <p className="text-[var(--text-secondary)] text-sm font-medium leading-normal">Crops</p>
          </Link>
          
          <Link 
            href="/sections" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--secondary-color)] transition-colors duration-200"
          >
            <div className="icon-secondary" data-icon="TreeStructure" data-size="24px" data-weight="regular">
              <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                <path d="M176,152a8,8,0,0,1-8,8H136v64a8,8,0,0,1-16,0V160H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,152ZM88,112h80a8,8,0,0,0,0-16H136V32a8,8,0,0,0-16,0V96H88a8,8,0,0,0,0,16Zm112-56H200a8,8,0,0,0,0-16h8a8,8,0,0,0,0-16H200a24,24,0,0,0-24,24V72a8,8,0,0,0,16,0V56h8Zm-8,88a8,8,0,0,0,8-8V112a8,8,0,0,0-16,0v24A8,8,0,0,0,192,144Zm8,16a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V168A8,8,0,0,0,200,160Zm-144,0a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V168A8,8,0,0,0,56,160Zm8-16a8,8,0,0,0,8-8V112a8,8,0,0,0-16,0v24A8,8,0,0,0,64,144ZM56,56H48V48a8,8,0,0,0-16,0v8H24a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V64h8a8,8,0,0,0,0-16Z"></path>
              </svg>
            </div>
            <p className="text-[var(--text-secondary)] text-sm font-medium leading-normal">Sections</p>
          </Link>
          
          <Link 
            href="/report/dashboard" 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              isActive('/report/dashboard') 
                ? 'bg-[var(--secondary-color)]' 
                : 'hover:bg-[var(--secondary-color)]'
            } transition-colors duration-200`}
          >
            <div className={isActive('/report/dashboard') ? 'icon-active' : 'icon-secondary'} data-icon="CurrencyDollar" data-size="24px" data-weight="fill">
              <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                <path d="M116,80h4v40h-4a20,20,0,0,1,0-40Zm32,56H136v40h12a20,20,0,0,0,0-40Zm84-8A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-48,28a36,36,0,0,0-36-36H136V80h4a20,20,0,0,1,20,20,8,8,0,0,0,16,0,36,36,0,0,0-36-36h-4V56a8,8,0,0,0-16,0v8h-4a36,36,0,0,0,0,72h4v40h-8a20,20,0,0,1-20-20,8,8,0,0,0-16,0,36,36,0,0,0,36,36h8v8a8,8,0,0,0,16,0v-8h12A36,36,0,0,0,184,156Z"></path>
              </svg>
            </div>
            <p className={`text-sm font-bold leading-normal ${
              isActive('/report/dashboard') 
                ? 'text-[var(--primary-color)]' 
                : 'text-[var(--text-secondary)]'
            }`}>
              Finance
            </p>
          </Link>
          
          <Link 
            href="/report" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--secondary-color)] transition-colors duration-200"
          >
            <div className="icon-secondary" data-icon="PresentationChart" data-size="24px" data-weight="regular">
              <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                <path d="M216,40H136V24a8,8,0,0,0-16,0V40H40A16,16,0,0,0,24,56V176a16,16,0,0,0,16,16H79.36L57.75,219a8,8,0,0,0,12.5,10l29.59-37h56.32l29.59,37a8,8,0,1,0,12.5-10l-21.61-27H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,136H40V56H216V176ZM104,120v24a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm32-16v40a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32-16v56a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Z"></path>
              </svg>
            </div>
            <p className="text-[var(--text-secondary)] text-sm font-medium leading-normal">Reports</p>
          </Link>
        </nav>
      </div>
      
      <div className="mt-auto">
        <Link 
          href="/admin" 
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--secondary-color)] transition-colors duration-200"
        >
          <div className="icon-secondary" data-icon="Gear" data-size="24px" data-weight="regular">
            <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
              <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"></path>
            </svg>
          </div>
          <p className="text-[var(--text-secondary)] text-sm font-medium leading-normal">Settings</p>
        </Link>
      </div>
    </aside>
  )
}