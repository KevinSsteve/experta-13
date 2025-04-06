
import { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [storeInfo, setStoreInfo] = useState({
    name: 'Moloja Supermercados',
    email: 'contato@moloja.com',
    phone: '(11) 1234-5678',
    address: 'Rua das Mercearias, 123',
  });
  const [notifications, setNotifications] = useState({
    lowStock: true,
    newSales: true,
    promotions: false,
  });
  const [currency, setCurrency] = useState('BRL');
  const [isSaving, setIsSaving] = useState(false);

  const handleStoreInfoChange = (field: string, value: string) => {
    setStoreInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Configurações salvas com sucesso!');
      setIsSaving(false);
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Store Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Loja</CardTitle>
                  <CardDescription>
                    Gerencie as informações básicas da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="store-name">Nome da Loja</Label>
                      <Input 
                        id="store-name" 
                        value={storeInfo.name}
                        onChange={(e) => handleStoreInfoChange('name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store-email">Email</Label>
                      <Input 
                        id="store-email" 
                        type="email"
                        value={storeInfo.email}
                        onChange={(e) => handleStoreInfoChange('email', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="store-phone">Telefone</Label>
                      <Input 
                        id="store-phone"
                        value={storeInfo.phone}
                        onChange={(e) => handleStoreInfoChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store-address">Endereço</Label>
                      <Input 
                        id="store-address"
                        value={storeInfo.address}
                        onChange={(e) => handleStoreInfoChange('address', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar Informações'}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Fiscal Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Fiscais</CardTitle>
                  <CardDescription>
                    Gerencie as configurações fiscais e de moeda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tax-id">CNPJ</Label>
                      <Input id="tax-id" placeholder="XX.XXX.XXX/XXXX-XX" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Moeda</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a moeda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">Real (R$)</SelectItem>
                          <SelectItem value="USD">Dólar (US$)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tax-rate">Alíquota de Impostos (%)</Label>
                      <Input id="tax-rate" type="number" step="0.01" defaultValue="18.00" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receipt-message">Mensagem do Recibo</Label>
                      <Input id="receipt-message" placeholder="Mensagem personalizada para recibos" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Appearance */}
              <Card>
                <CardHeader>
                  <CardTitle>Aparência</CardTitle>
                  <CardDescription>
                    Personalize a aparência do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode">Tema Escuro</Label>
                      <p className="text-sm text-muted-foreground">
                        Alterar entre tema claro e escuro
                      </p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={theme === 'dark'}
                      onCheckedChange={toggleTheme}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Notificações</CardTitle>
                  <CardDescription>
                    Configure os alertas e notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="low-stock">Alertas de Estoque Baixo</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba alertas quando produtos estiverem com estoque baixo
                      </p>
                    </div>
                    <Switch
                      id="low-stock"
                      checked={notifications.lowStock}
                      onCheckedChange={(checked) => setNotifications({...notifications, lowStock: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-sales">Novas Vendas</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba alertas sobre novas vendas
                      </p>
                    </div>
                    <Switch
                      id="new-sales"
                      checked={notifications.newSales}
                      onCheckedChange={(checked) => setNotifications({...notifications, newSales: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="promotions">Promoções</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba alertas sobre promoções e ofertas
                      </p>
                    </div>
                    <Switch
                      id="promotions"
                      checked={notifications.promotions}
                      onCheckedChange={(checked) => setNotifications({...notifications, promotions: checked})}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar Preferências'}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* System Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Versão</p>
                    <p className="text-sm text-muted-foreground">1.0.0</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Última Atualização</p>
                    <p className="text-sm text-muted-foreground">06/04/2025</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">Verificar Atualizações</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
