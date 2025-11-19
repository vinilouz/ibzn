<script lang="ts">
    import { goto } from '$app/navigation';
    import { Button } from '$lib/components/ui/button';
    import { Badge } from '$lib/components/ui/badge';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
    import { 
        Table, 
        TableBody, 
        TableCell, 
        TableHead, 
        TableHeader, 
        TableRow 
    } from '$lib/components/ui/table';
    import { 
        ArrowLeft, 
        Users, 
        ImageOff, 
        Calendar, 
        BookOpen, 
        CheckCircle2, 
        XCircle, 
        Clock,
        Eye
    } from 'lucide-svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    function getStatusBadge(status: string | null) {
        const statusMap: Record<string, { label: string; class: string }> = {
            active: { label: 'Ativo', class: 'bg-green-100 text-green-800' },
            completed: { label: 'Concluído', class: 'bg-blue-100 text-blue-800' },
            cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-800' },
            dropped: { label: 'Desistente', class: 'bg-gray-100 text-gray-800' },
            pending: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800' }
        };
        return statusMap[status || 'active'] || statusMap.active;
    }

    function formatDate(date: string | Date | null) {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('pt-BR');
    }

    function calculateAttendancePercentage(present: number, total: number) {
        if (total === 0) return 0;
        return Math.round((present / total) * 100);
    }

    function translateWeekdays(weekdays: string | null) {
        if (!weekdays) return '-';
        
        const translations: Record<string, string> = {
            'monday': 'Segunda',
            'tuesday': 'Terça',
            'wednesday': 'Quarta',
            'thursday': 'Quinta',
            'friday': 'Sexta',
            'saturday': 'Sábado',
            'sunday': 'Domingo',
            'mon': 'Seg',
            'tue': 'Ter',
            'wed': 'Qua',
            'thu': 'Qui',
            'fri': 'Sex',
            'sat': 'Sáb',
            'sun': 'Dom'
        };

        return weekdays
            .split(',')
            .map(day => {
                const trimmedDay = day.trim().toLowerCase();
                return translations[trimmedDay] || day.trim();
            })
            .join(', ');
    }
</script>

<div class="mx-auto w-full max-w-7xl p-8">
    <div class="mb-6">
        <Button variant="ghost" onclick={() => goto('/painel')}>
            <ArrowLeft class="h-4 w-4 mr-2" />
            Voltar ao Painel
        </Button>
    </div>

    <Card class="mb-8 overflow-hidden">
        {#if data.room.imageUrl}
            <div class="w-full h-[500px] bg-muted flex items-center justify-center overflow-hidden">
                <img 
                    src={data.room.imageUrl} 
                    alt={data.room.name} 
                    class="max-w-full max-h-full object-contain"
                />
            </div>
        {:else}
            <div class="h-[500px] w-full bg-gradient-to-br from-muted/50 to-muted flex flex-col items-center justify-center">
                <ImageOff class="h-24 w-24 text-muted-foreground" />
                <p class="text-muted-foreground mt-4">Nenhuma imagem disponível</p>
            </div>
        {/if}

        <CardHeader>
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <CardTitle class="text-3xl mb-2">{data.room.name}</CardTitle>
                    <CardDescription class="text-lg">Sala #{data.room.number}</CardDescription>
                </div>
                <span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold {data.room.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    {data.room.status ? '● Ativa' : '● Inativa'}
                </span>
            </div>
        </CardHeader>

        <CardContent class="space-y-4">
            {#if data.room.description}
                <div class="pb-4 border-b">
                    <p class="text-muted-foreground">{data.room.description}</p>
                </div>
            {/if}
            
            <div class="flex items-center gap-4 text-sm text-muted-foreground">
                {#if data.room.createdAt}
                    <span class="flex items-center gap-1">
                        <Calendar class="h-4 w-4" />
                        Criada em {formatDate(data.room.createdAt)}
                    </span>
                {/if}
            </div>
        </CardContent>
    </Card>

    <Card class="mb-8">
        <CardHeader>
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <CardTitle class="text-xl">Informações da Sala</CardTitle>
                </div>
            </div>
        </CardHeader>

        <CardContent class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader class="pb-3">
                        <CardTitle class="text-sm font-medium text-muted-foreground">Capacidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="flex items-center gap-2">
                            <Users class="h-5 w-5 text-muted-foreground" />
                            <span class="text-2xl font-bold">
                                {data.room.capacity || 'Sem limite'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader class="pb-3">
                        <CardTitle class="text-sm font-medium text-muted-foreground">Cursos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="flex items-center gap-2">
                            <BookOpen class="h-5 w-5 text-muted-foreground" />
                            <span class="text-2xl font-bold">{data.courses?.length || 0}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader class="pb-3">
                        <CardTitle class="text-sm font-medium text-muted-foreground">Participantes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="flex items-center gap-2">
                            <Users class="h-5 w-5 text-muted-foreground" />
                            <span class="text-2xl font-bold">{data.participants?.length || 0}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Button onclick={() => goto(`/salas?view=edit&id=${data.room.id}`)}>
                Editar Sala
            </Button>
        </CardContent>
    </Card>

    {#if data.courses && data.courses.length > 0}
        <Card class="mb-8">
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <BookOpen class="h-5 w-5" />
                    Cursos nesta Sala
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Curso</TableHead>
                                <TableHead>Horário</TableHead>
                                <TableHead>Dias da Semana</TableHead>
                                <TableHead>Matrículas</TableHead>
                                <TableHead class="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {#each data.courses as course}
                                <TableRow>
                                    <TableCell class="font-medium">{course.courseName}</TableCell>
                                    <TableCell>
                                        {#if course.startTime && course.endTime}
                                            {course.startTime} - {course.endTime}
                                        {:else}
                                            -
                                        {/if}
                                    </TableCell>
                                    <TableCell>{translateWeekdays(course.weekdays)}</TableCell>
                                    <TableCell>
                                        {course.enrollmentCount}/{course.capacity || '∞'}
                                    </TableCell>
                                    <TableCell class="text-right">
                                        <Button size="sm" variant="outline" onclick={() => goto(`/cursos?view=edit&id=${course.id}`)}>
                                            Ver Curso
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            {/each}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    {/if}

    {#if data.participants && data.participants.length > 0}
        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <Users class="h-5 w-5" />
                    Participantes ({data.participants.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Curso</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Presença</TableHead>
                                <TableHead>Matrícula</TableHead>
                                <TableHead class="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {#each data.participants as item}
                                {@const statusInfo = getStatusBadge(item.enrollmentStatus)}
                                {@const attendancePercent = calculateAttendancePercentage(
                                    item.attendancePresent, 
                                    item.attendanceTotal
                                )}
                                <TableRow>
                                    <TableCell class="font-medium">
                                        {item.participant.name}
                                    </TableCell>
                                    <TableCell>{item.courseName}</TableCell>
                                    <TableCell>
                                        <Badge class={statusInfo.class}>
                                            {statusInfo.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div class="flex items-center gap-2">
                                            {#if item.attendanceTotal > 0}
                                                <div class="flex items-center gap-1">
                                                    {#if attendancePercent >= 75}
                                                        <CheckCircle2 class="h-4 w-4 text-green-600" />
                                                    {:else if attendancePercent >= 50}
                                                        <Clock class="h-4 w-4 text-yellow-600" />
                                                    {:else}
                                                        <XCircle class="h-4 w-4 text-red-600" />
                                                    {/if}
                                                    <span class="text-sm">
                                                        {item.attendancePresent}/{item.attendanceTotal} ({attendancePercent}%)
                                                    </span>
                                                </div>
                                            {:else}
                                                <span class="text-sm text-muted-foreground">Sem registros</span>
                                            {/if}
                                        </div>
                                    </TableCell>
                                    <TableCell class="text-sm text-muted-foreground">
                                        {formatDate(item.enrolledAt)}
                                    </TableCell>
                                    <TableCell class="text-right">
                                        <div class="flex justify-end gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onclick={() => goto(`/presenca?courseId=${item.courseId}&participantId=${item.participant.id}`)}
                                            >
                                                <Eye class="h-4 w-4 mr-1" />
                                                Presenças
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="ghost"
                                                onclick={() => goto(`/participants?view=edit&id=${item.participant.id}`)}
                                            >
                                                Ver Perfil
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            {/each}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    {:else}
        <Card>
            <CardContent class="p-12 text-center">
                <Users class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p class="text-muted-foreground mb-4">Nenhum participante matriculado em cursos desta sala</p>
            </CardContent>
        </Card>
    {/if}
</div>