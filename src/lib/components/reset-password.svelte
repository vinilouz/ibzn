<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { authClient } from '$lib/auth.client';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    
    let password = $state('');
    let confirmPassword = $state('');
    let loading = $state(false);
    let error = $state('');
    let success = $state(false);
    
    $effect(() => {
        const token = $page.url.searchParams.get('token');
        if (!token) {
            error = 'Link inválido ou expirado';
        }
    });
    
    const handlePasswordReset = async () => {
        if (!password || !confirmPassword) {
            error = 'Preencha todos os campos';
            return;
        }
        
        if (password !== confirmPassword) {
            error = 'As senhas não coincidem';
            return;
        }
        
        if (password.length < 8) {
            error = 'A senha deve ter pelo menos 8 caracteres';
            return;
        }
        
        const token = $page.url.searchParams.get('token');
        if (!token) {
            error = 'Link inválido ou expirado';
            return;
        }
        
        loading = true;
        error = '';
        
        try {
            await authClient.resetPassword({
                newPassword: password,
                token: token
            });
            
            success = true;
            
            
            setTimeout(() => {
                goto('/login');
            }, 2000);
        } catch (err: any) {
            console.error('Reset error:', err);
            error = err?.message || 'Erro ao redefinir senha. O link pode estar expirado.';
        } finally {
            loading = false;
        }
    };
</script>

<div class="flex min-h-screen items-center justify-center p-4">
    <div class="w-full max-w-md space-y-8">
        <a href="/" class="flex items-center justify-center">
            <img 
                src="/images/logo.svg" 
                width="200" 
                alt="Logo Instituto Brasa Zona Norte" 
                class="h-auto"
            />
        </a>
        
        <Card class="w-full">
            <CardHeader class="text-center">
                <CardTitle class="text-2xl">Nova senha</CardTitle>
                <CardDescription class="text-balance">
                    Digite sua nova senha abaixo
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                {#if success}
                    <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                        Senha redefinida com sucesso! Redirecionando para o login...
                    </div>
                {:else if error}
                    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                {/if}
                
                <div class="space-y-2">
                    <Label for="password">Nova senha</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        bind:value={password}
                        required
                        disabled={success}
                    />
                </div>
                
                <div class="space-y-2">
                    <Label for="confirmPassword">Confirmar senha</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        bind:value={confirmPassword}
                        required
                        disabled={success}
                    />
                </div>
                
                <Button
                    class="w-full"
                    onclick={handlePasswordReset}
                    disabled={loading || success}
                >
                    {#if loading}
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {/if}
                    Redefinir senha
                </Button>
                
                <div class="text-center text-sm">
                    <a href="/login" class="text-primary hover:underline">
                        Voltar para o login
                    </a>
                </div>
            </CardContent>
        </Card>
    </div>
</div>