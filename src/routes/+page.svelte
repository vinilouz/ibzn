<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
    import { goto } from '$app/navigation';
</script>

<div class="p-8 max-w-7xl mx-auto">
    <h1 class="text-4xl font-bold mb-2">Bem-vindo ao IBZN</h1>
    <p class="text-gray-600 mb-8">Sistema de Gerenciamento</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card class="hover:shadow-lg transition-shadow cursor-pointer" onclick={() => goto('/rooms?view=list')}>
            <CardHeader>
                <CardTitle>Salas</CardTitle>
                <CardDescription>Gerencie as salas do sistema</CardDescription>
            </CardHeader>
            <CardContent>
                <Button class="w-full" onclick={() => goto('/rooms?view=list')}>
                    Acessar
                </Button>
            </CardContent>
        </Card>
    </div>
</div>
