import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategories } from "@/lib/products-data";
import { Product } from "@/contexts/CartContext";
import { Image as LucideImage, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  price: z.coerce.number().positive("O preço deve ser positivo"),
  purchase_price: z.coerce.number().min(0, "O preço de compra não pode ser negativo"),
  category: z.string().min(1, "Selecione uma categoria"),
  stock: z.coerce.number().int("A quantidade deve ser um número inteiro").min(0, "Não pode ser negativo"),
  description: z.string().optional(),
  code: z.string().optional(),
  image: z.string().default("/placeholder.svg"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductFormValues) => void;
  defaultValues?: Partial<Product>;
  isSubmitting?: boolean;
}

const resizeImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      if (img.width <= maxWidth && img.height <= maxHeight && file.size <= 2 * 1024 * 1024) {
        resolve(file);
        return;
      }
      
      let newWidth = img.width;
      let newHeight = img.height;
      
      if (newWidth > maxWidth) {
        newHeight = Math.round(newHeight * (maxWidth / newWidth));
        newWidth = maxWidth;
      }
      
      if (newHeight > maxHeight) {
        newWidth = Math.round(newWidth * (maxHeight / newHeight));
        newHeight = maxHeight;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Não foi possível criar o contexto do canvas'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Falha ao converter canvas para blob'));
          return;
        }
        
        const resizedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
        
        console.log(`Imagem redimensionada: Original ${(file.size / 1024).toFixed(2)}KB -> Nova ${(resizedFile.size / 1024).toFixed(2)}KB`);
        resolve(resizedFile);
      }, file.type, quality);
    };
    
    img.onerror = () => {
      reject(new Error('Erro ao carregar a imagem'));
    };
  });
};

export function ProductForm({ onSubmit, defaultValues, isSubmitting = false }: ProductFormProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesList = await getCategories();
        setCategories(categoriesList);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategories(["Alimentos Básicos", "Laticínios", "Hortifruti", "Carnes", "Padaria", "Bebidas", "Limpeza", "Higiene"]);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    if (defaultValues?.image && defaultValues.image !== "/placeholder.svg") {
      setPreviewImage(defaultValues.image);
    }
  }, [defaultValues?.image]);

  const calculateProfitMargin = (price: number, purchasePrice: number): string => {
    if (!purchasePrice || purchasePrice <= 0) return "N/A";
    const margin = ((price - purchasePrice) / purchasePrice) * 100;
    return `${margin.toFixed(2)}%`;
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      price: defaultValues?.price || 0,
      purchase_price: (defaultValues as any)?.purchase_price || 0,
      category: defaultValues?.category || "",
      stock: defaultValues?.stock || 0,
      description: defaultValues?.description || "",
      code: defaultValues?.code || "",
      image: defaultValues?.image || "/placeholder.svg",
    },
  });

  const [profitMargin, setProfitMargin] = useState<string>("N/A");
  const price = form.watch("price");
  const purchasePrice = form.watch("purchase_price");
  const currentImage = form.watch("image");

  useEffect(() => {
    setProfitMargin(calculateProfitMargin(price, purchasePrice));
  }, [price, purchasePrice]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem válido");
      return;
    }

    try {
      setIsUploading(true);
      
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      
      let fileToUpload: File;
      if (file.size > 2 * 1024 * 1024) {
        toast.info("Redimensionando imagem para otimizar o upload...");
        fileToUpload = await resizeImage(file);
      } else {
        fileToUpload = file;
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      form.setValue("image", data.publicUrl);
      toast.success("Imagem carregada com sucesso");
      
    } catch (error: any) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast.error(`Falha ao carregar imagem: ${error.message || "Erro desconhecido"}`);
      
      setPreviewImage(currentImage !== "/placeholder.svg" ? currentImage : null);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  function handleSubmit(data: ProductFormValues) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Produto</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do produto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchase_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Compra (Kz)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Venda (Kz)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  Margem de lucro: {profitMargin}
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade em Estoque</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código do Produto</FormLabel>
                <FormControl>
                  <Input placeholder="Opcional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Digite uma descrição para o produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem do Produto</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="hidden"
                    {...field}
                  />
                  <div className="border rounded-md p-2">
                    <div className="flex items-center justify-center h-[150px] bg-muted/30 rounded-md overflow-hidden">
                      {previewImage || field.value !== "/placeholder.svg" ? (
                        <img 
                          src={previewImage || field.value} 
                          alt="Preview" 
                          className="object-contain h-full w-full"
                        />
                      ) : (
                        <LucideImage className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 justify-center">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={triggerFileInput}
                    disabled={isUploading}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Carregando..." : "Carregar da Galeria"}
                  </Button>

                  <FormControl>
                    <Input 
                      placeholder="Ou insira uma URL de imagem" 
                      value={field.value === "/placeholder.svg" ? "" : field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value || "/placeholder.svg");
                        if (e.target.value) {
                          setPreviewImage(e.target.value);
                        } else {
                          setPreviewImage(null);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: JPG, PNG, GIF (qualquer tamanho - imagens grandes serão redimensionadas)
                  </p>
                </div>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || isUploading} className="mt-4">
          {isSubmitting ? "Salvando..." : defaultValues?.id ? "Atualizar Produto" : "Adicionar Produto"}
        </Button>
      </form>
    </Form>
  );
}
