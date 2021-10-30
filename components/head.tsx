import NextHead from "next/head";

const defaultTitle = process.env.NEXT_PUBLIC_APP_TITLE || "";
const defaultDescription = process.env.NEXT_PUBLIC_DEFAULT_DESCRIPTION || "";
const defaultOGURL = process.env.NEXT_PUBLIC_BASE_URL || "";
const defaultOGImage = `${process.env.NEXT_PUBLIC_BASE_URL}/fpo/social-card.jpg`;
const favicon = "/images/logo.png";

type HeadProps = {
  title?: string;
  description?: string;
  url?: string;
  ogImage?: string;
};

const Head = ({ title, description, url, ogImage }: HeadProps) => (
  <NextHead>
    <meta charSet="UTF-8" />
    <title>{title ? `${defaultTitle} | ${title}` : defaultTitle}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description || defaultDescription} />
    <link rel="icon" type="image/png" sizes="24x24" href={favicon} />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css"
      integrity="sha384-AYmEC3Yw5cVb3ZcuHtOA93w35dYTsvhLPVnYs9eStHfGJvOvKxVfELGroGkvsg+p"
      crossOrigin="anonymous"
    />
    <meta property="og:url" content={url || defaultOGURL} />
    <meta property="og:title" content={title || ""} />
    <meta
      property="og:description"
      content={description || defaultDescription}
    />
    <meta name="twitter:site" content={url || defaultOGURL} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={ogImage || defaultOGImage} />
    <meta property="og:image" content={ogImage || defaultOGImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
  </NextHead>
);

export default Head;
