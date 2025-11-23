<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { authClient } from '$lib/auth.client';
    
    let email = $state('');
    let loading = $state(false);
    let error = $state('');
    let success = $state(false);
    
    const handlePasswordReset = async () => {
        if (!email) {
            error = 'Preencha o campo de email';
            return;
        }
        
        loading = true;
        error = '';
        success = false;
        
        try {
            await authClient.requestPasswordReset({
                email: email,
                redirectTo: `${window.location.origin}/reset-password`,
            });
            success = true;
        } catch (err) {
            error = 'Erro ao enviar link de redefinição. Verifique o email e tente novamente.';
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
                <CardTitle class="text-2xl">Redefinição de senha</CardTitle>
                <CardDescription class="text-balance">
                    Digite o email vinculado à sua conta para receber um link de redefinição de senha.
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                {#if success}
                    <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                        Link enviado! Verifique seu email (incluindo a caixa de spam).
                    </div>
                {:else if error}
                    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                {/if}
                
                <div class="space-y-2">
                    <Label for="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        bind:value={email}
                        required
                    />
                </div>
                
                <Button
                    class="w-full"
                    onclick={handlePasswordReset}
                    disabled={loading}
                >
                    {#if loading}
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {/if}
                    Enviar link de redefinição
                </Button>
            </CardContent>
        </Card>
    </div>
</div>
