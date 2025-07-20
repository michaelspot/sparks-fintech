"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function OAuthAdminPage() {
  const [authUrl, setAuthUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'none' | 'pending' | 'success' | 'error'>('none');
  const [message, setMessage] = useState<string>('');

  const handleInitAuth = async () => {
    setIsLoading(true);
    setAuthStatus('none');
    setMessage('');

    try {
      const response = await fetch('/api/auth/init');
      const data = await response.json();

      if (response.ok) {
        setAuthUrl(data.authUrl);
        setAuthStatus('pending');
        setMessage('URL d\'authentification générée. Cliquez pour vous connecter avec omet.fintech@gmail.com');
      } else {
        setAuthStatus('error');
        setMessage(data.error || 'Erreur lors de la génération de l\'URL');
      }
    } catch (error) {
      setAuthStatus('error');
      setMessage('Erreur réseau lors de la génération de l\'URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthCallback = async () => {
    // Cette fonction sera appelée automatiquement par le callback
    setAuthStatus('success');
    setMessage('Authentification OAuth réussie ! L\'export PDF est maintenant configuré.');
  };

  const checkTokens = async () => {
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variables: { test: 'test' },
          filename: 'test-connection'
        })
      });

      if (response.status === 500) {
        const error = await response.json();
        if (error.details?.includes('Tokens OAuth non trouvés')) {
          setAuthStatus('error');
          setMessage('Tokens OAuth manquants. Authentification requise.');
        } else if (error.details?.includes('storage quota')) {
          setAuthStatus('error');
          setMessage('Problème de quota. L\'authentification OAuth est nécessaire.');
        } else {
          setAuthStatus('success');
          setMessage('Tokens OAuth présents mais autre erreur: ' + error.details);
        }
      } else {
        setAuthStatus('success');
        setMessage('Tokens OAuth valides ! Export PDF prêt.');
      }
    } catch (error) {
      setAuthStatus('error');
      setMessage('Erreur lors de la vérification des tokens');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuration OAuth Google</h1>
          <p className="text-muted-foreground mt-2">
            Configurez l'authentification OAuth pour l'export PDF avec le compte omet.fintech@gmail.com
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Statut de l'authentification
              {authStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {authStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
              {authStatus === 'pending' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
            </CardTitle>
            <CardDescription>
              État actuel de la configuration OAuth pour l'export PDF
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  authStatus === 'success' ? 'default' : 
                  authStatus === 'pending' ? 'secondary' : 
                  authStatus === 'error' ? 'destructive' : 'outline'
                }
              >
                {authStatus === 'success' ? 'Configuré' : 
                 authStatus === 'pending' ? 'En attente' : 
                 authStatus === 'error' ? 'Erreur' : 'Non configuré'}
              </Badge>
              <Button variant="outline" size="sm" onClick={checkTokens}>
                Vérifier le statut
              </Button>
            </div>
            
            {message && (
              <div className={`p-3 rounded-md text-sm ${
                authStatus === 'success' ? 'bg-green-50 text-green-800' :
                authStatus === 'error' ? 'bg-red-50 text-red-800' :
                'bg-blue-50 text-blue-800'
              }`}>
                {message}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration initiale</CardTitle>
            <CardDescription>
              Lancez l'authentification OAuth avec le compte omet.fintech@gmail.com
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Étapes à suivre :
              </p>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Cliquer sur "Générer l'URL d'authentification"</li>
                <li>Se connecter avec le compte <strong>omet.fintech@gmail.com</strong></li>
                <li>Autoriser l'accès aux Google Docs et Google Drive</li>
                <li>Revenir sur cette page pour vérifier le statut</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleInitAuth} 
                disabled={isLoading}
              >
                {isLoading ? 'Génération...' : 'Générer l\'URL d\'authentification'}
              </Button>
              
              {authUrl && (
                <Button 
                  variant="outline" 
                  onClick={() => window.open(authUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Se connecter avec OAuth
                </Button>
              )}
            </div>
            
            {authUrl && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-800 mb-2">URL d'authentification générée :</p>
                <code className="text-xs bg-white p-2 rounded border text-blue-600 block break-all">
                  {authUrl}
                </code>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions pour Google Cloud Console</CardTitle>
            <CardDescription>
              Configuration requise dans Google Cloud Console
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p><strong>1. Vérifiez vos credentials OAuth :</strong></p>
              <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
                <li>Allez sur <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 underline">Google Cloud Console</a></li>
                <li>Sélectionnez le projet "omet-455817"</li>
                <li>Allez dans "APIs et services" → "Identifiants"</li>
                <li>Vérifiez que vous avez un "ID client OAuth 2.0"</li>
                <li>Mettez à jour le fichier <code>google-oauth-credentials.json</code> avec vos vraies credentials</li>
              </ul>
              
              <p><strong>2. URI de redirection autorisés :</strong></p>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">http://localhost:3001/api/auth/callback</code>
              
              <p><strong>3. APIs activées :</strong></p>
              <ul className="list-disc list-inside text-muted-foreground ml-4">
                <li>Google Docs API</li>
                <li>Google Drive API</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
