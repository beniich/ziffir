import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import './breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // Génère et injecte le JSON-LD BreadcrumbList
  useEffect(() => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        ...(item.path && { item: `https://www.ziffir.com${item.path}` }),
      })),
    };
    
    let script = document.getElementById('breadcrumb-jsonld') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'breadcrumb-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
    
    return () => {
      if (script) script.remove();
    };
  }, [items]);
  
  return (
    <nav 
      aria-label="Fil d'Ariane" 
      className={`breadcrumb ${className}`}
      itemScope 
      itemType="https://schema.org/Breadcrumb"
    >
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li 
              key={index} 
              className={`breadcrumb-item ${isLast ? 'current' : ''}`}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {item.path && !isLast ? (
                <>
                  <Link 
                    to={item.path} 
                    className="breadcrumb-link"
                    itemProp="item"
                  >
                    <span itemProp="name">{item.label}</span>
                  </Link>
                  <meta itemProp="position" content={String(index + 1)} />
                  <span className="breadcrumb-separator" aria-hidden="true">
                    ›
                  </span>
                </>
              ) : (
                <>
                  <span className="breadcrumb-current" itemProp="name">
                    {item.label}
                  </span>
                  <meta itemProp="position" content={String(index + 1)} />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
