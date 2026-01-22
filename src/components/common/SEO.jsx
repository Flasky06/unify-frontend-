import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, image, url }) => {
    const siteTitle = "mflow pos";
    const defaultDescription = "Smart Retail POS & Inventory Management System for growing businesses in Kenya.";
    const defaultImage = "/m-logo.jpg"; // Updated to use the new favicon/logo
    const domain = "https://mflowpos.com";

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title ? `${title} - ${siteTitle}` : siteTitle}</title>
            <meta name='description' content={description || defaultDescription} />

            {/* Open Graph tags (Facebook, LinkedIn, etc.) */}
            <meta property="og:type" content={type || 'website'} />
            <meta property="og:title" content={title ? `${title} - ${siteTitle}` : siteTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:url" content={url ? `${domain}${url}` : domain} />
            <meta property="og:image" content={image ? `${domain}${image}` : `${domain}${defaultImage}`} />

            {/* Twitter tags */}
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={title ? `${title} - ${siteTitle}` : siteTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            <meta name="twitter:image" content={image ? `${domain}${image}` : `${domain}${defaultImage}`} />

            {/* Canonical URL */}
            {url && <link rel="canonical" href={`${domain}${url}`} />}
        </Helmet>
    );
};

export default SEO;
