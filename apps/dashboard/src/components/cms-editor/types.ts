export type BlockContent = {
  title?: string;
  subtitle?: string;
  text?: string;
  styles?: {
    paddingY?: number;
    background?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export type Block = {
  id: string;
  type: string;
  content: BlockContent;
}

export type PageSettings = {
  title: string;
  slug: string;
  description: string;
  status: string;
  metaTitle: string;
  metaDescription: string;
}