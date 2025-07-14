import { AdminChat } from '@/components/AdminChat';

export default function AdminChatPage() {
  return (
    <div className="min-h-screen bg-gradient-main">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img 
                  src="https://storange.tudinha.com.br/colag.png" 
                  alt="Colégio Almeida Garrett" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Colégio Almeida Garrett
                </h1>
                <p className="text-sm text-gray-500">Chat Admin com IA</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Acesso exclusivo para administradores
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <AdminChat />
      </main>
    </div>
  );
}