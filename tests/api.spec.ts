import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:5050/api';

test.describe.serial('Streamix E2E Tests', () => {

    let userToken1 = '';
    let userToken2 = '';
    let userId1 = 0;
    let userId2 = 0;
    let videoId = 0;
    let commentId = 0;
    const timestamp = Date.now();
    const user1 = { username: `user1_${timestamp}`, email: `user1_${timestamp}@test.com`, password: 'password123' };
    const user2 = { username: `user2_${timestamp}`, email: `user2_${timestamp}@test.com`, password: 'password123' };

    // --- SETUP FIXTURES ---
    test.beforeAll(async () => {
        const fixturesDir = path.resolve(__dirname, 'fixtures');
        if (!fs.existsSync(fixturesDir)) {
            fs.mkdirSync(fixturesDir, { recursive: true });
        }
        const videoPath = path.resolve(fixturesDir, 'test.mp4');
        const thumbPath = path.resolve(fixturesDir, 'thumb.jpg');

        // Creamos archivos dummies básicos si no existen para que las pruebas no fallen por lectura de disco
        if (!fs.existsSync(videoPath)) fs.writeFileSync(videoPath, 'dummy video content');
        if (!fs.existsSync(thumbPath)) fs.writeFileSync(thumbPath, 'dummy image content');
    });

    // --- BLOQUE 1: AUTENTICACIÓN (10 Tests) ---
    test.describe('Autenticación', () => {
        test('1. Signup exitoso usuario 1', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/auth/signup`, { data: user1 });
            expect(res.status()).toBe(201);
            const body = await res.json();
            expect(body.message).toBe('Usuario creado exitosamente');
            expect(body.token).toBeDefined();
            userToken1 = body.token;
            userId1 = body.usuario.id;
        });

        test('2. Signup exitoso usuario 2', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/auth/signup`, { data: user2 });
            expect(res.status()).toBe(201);
            const body = await res.json();
            userToken2 = body.token;
            userId2 = body.usuario.id;
        });

        test('3. Signup falla por falta de campos', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/auth/signup`, { data: { username: 'fail' } });
            expect(res.status()).toBe(400);
        });

        test('4. Signup falla por email existente', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/auth/signup`, {
                data: { username: `fail_${timestamp}`, email: user1.email, password: 'pw' }
            });
            expect(res.status()).toBe(400);
        });

        test('5. Signup falla por username existente', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/auth/signup`, {
                data: { username: user1.username, email: `fail_${timestamp}@test.com`, password: 'pw' }
            });
            expect(res.status()).toBe(400);
        });

        test('6. Login exitoso', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/auth/login`, {
                data: { email: user1.email, password: user1.password }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.token).toBeDefined();
        });

        test('7. Login falla por contraseña incorrecta', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/auth/login`, {
                data: { email: user1.email, password: 'wrongpassword' }
            });
            expect(res.status()).toBe(401);
        });

        test('8. Login falla por email inexistente', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/auth/login`, {
                data: { email: 'no_existe@test.com', password: 'pw' }
            });
            expect(res.status()).toBe(401);
        });

        test('9. Obtener perfil actual (auth/me) exitoso', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${userToken1}` }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.usuario.email).toBe(user1.email);
        });

        test('10. Obtener perfil actual sin token falla', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/auth/me`);
            expect(res.status()).toBe(401);
        });
    });

    // --- BLOQUE 2: GESTIÓN DE USUARIOS (13 Tests) ---
    test.describe('Gestión de Usuarios', () => {
        test('11. Obtener todos los usuarios', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/users`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(Array.isArray(body.usuarios)).toBeTruthy();
        });

        test('12. Obtener usuarios con paginación', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/users?page=1&per_page=1`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.usuarios.length).toBeLessThanOrEqual(1);
        });

        test('13. Crear usuario (Ruta Admin) falla sin token (si aplica)', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/users`, {
                data: { username: `admin_created_${timestamp}`, email: `admin_${timestamp}@test.com`, password: 'pw' }
            });
            // Dependiendo de tu lógica esto puede ser 201 o requerir auth
            expect([201, 401]).toContain(res.status());
        });

        test('14. Obtener usuario por ID válido', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/users/${userId1}`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.usuario.id).toBe(userId1);
        });

        test('15. Obtener usuario por ID inexistente', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/users/999999`);
            expect(res.status()).toBe(404);
        });

        test('16. Actualizar información de usuario propio exitoso', async ({ request }) => {
            const res = await request.put(`${BASE_URL}/users/${userId1}`, {
                headers: { 'Authorization': `Bearer ${userToken1}` },
                data: { bio: 'Esta es mi nueva biografía' }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.usuario.bio).toBe('Esta es mi nueva biografía');
        });

        test('17. Actualizar usuario ajeno falla (No autorizado)', async ({ request }) => {
            const res = await request.put(`${BASE_URL}/users/${userId1}`, {
                headers: { 'Authorization': `Bearer ${userToken2}` },
                data: { bio: 'Hacked bio' }
            });
            expect(res.status()).toBe(403);
        });

        test('18. Subir avatar exitoso', async ({ request }) => {
            const file = path.resolve(__dirname, 'fixtures', 'thumb.jpg');
            const res = await request.post(`${BASE_URL}/users/${userId1}/avatar`, {
                headers: { 'Authorization': `Bearer ${userToken1}` },
                multipart: {
                    file: {
                        name: 'thumb.jpg',
                        mimeType: 'image/jpeg',
                        buffer: fs.readFileSync(file)
                    }
                }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.avatar_url).toBeDefined();
        });

        test('19. Subir avatar con extensión inválida', async ({ request }) => {
            const file = path.resolve(__dirname, 'fixtures', 'test.mp4'); // mp4 no es imagen
            const res = await request.post(`${BASE_URL}/users/${userId1}/avatar`, {
                headers: { 'Authorization': `Bearer ${userToken1}` },
                multipart: {
                    file: {
                        name: 'test.txt',
                        mimeType: 'text/plain',
                        buffer: Buffer.from('not an image')
                    }
                }
            });
            expect(res.status()).toBe(400);
        });

        test('20. Subir avatar sin archivo', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/users/${userId1}/avatar`, {
                headers: { 'Authorization': `Bearer ${userToken1}` },
                multipart: {}
            });
            expect(res.status()).toBe(400);
        });

        test('21. Obtener suscriptores de usuario', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/users/${userId1}/subscribers`);
            expect(res.status()).toBe(200);
        });

        test('22. Eliminar usuario ajeno falla', async ({ request }) => {
            const res = await request.delete(`${BASE_URL}/users/${userId1}`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(403);
        });

        test('23. Logout exitoso', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/auth/logout`, {
                headers: { 'Authorization': `Bearer ${userToken1}` }
            });
            expect(res.status()).toBe(200);
        });
    });

    // --- BLOQUE 3: GESTIÓN DE VIDEOS (16 Tests) ---
    test.describe('Gestión de Videos', () => {
        test('24. Subir video exitoso', async ({ request }) => {
            const videoFile = path.resolve(__dirname, 'fixtures', 'test.mp4');
            const thumbFile = path.resolve(__dirname, 'fixtures', 'thumb.jpg');

            const res = await request.post(`${BASE_URL}/videos`, {
                headers: { 'Authorization': `Bearer ${userToken1}` },
                multipart: {
                    title: `Test Video ${timestamp}`,
                    description: 'Descripción de prueba',
                    video: { name: 'test.mp4', mimeType: 'video/mp4', buffer: fs.readFileSync(videoFile) },
                    thumbnail: { name: 'thumb.jpg', mimeType: 'image/jpeg', buffer: fs.readFileSync(thumbFile) }
                }
            });
            expect(res.status()).toBe(201);
            const body = await res.json();
            expect(body.video.id).toBeDefined();
            videoId = body.video.id;
        });

        test('25. Subir video sin autenticación falla', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos`, { multipart: { title: 'Test' } });
            expect(res.status()).toBe(401);
        });

        test('26. Subir video sin miniatura falla', async ({ request }) => {
            const videoFile = path.resolve(__dirname, 'fixtures', 'test.mp4');
            const res = await request.post(`${BASE_URL}/videos`, {
                headers: { 'Authorization': `Bearer ${userToken1}` },
                multipart: {
                    title: `Test Video 2`,
                    video: { name: 'test.mp4', mimeType: 'video/mp4', buffer: fs.readFileSync(videoFile) }
                }
            });
            expect(res.status()).toBe(400);
        });

        test('27. Subir video sin titulo falla', async ({ request }) => {
            const videoFile = path.resolve(__dirname, 'fixtures', 'test.mp4');
            const thumbFile = path.resolve(__dirname, 'fixtures', 'thumb.jpg');
            const res = await request.post(`${BASE_URL}/videos`, {
                headers: { 'Authorization': `Bearer ${userToken1}` },
                multipart: {
                    video: { name: 'test.mp4', mimeType: 'video/mp4', buffer: fs.readFileSync(videoFile) },
                    thumbnail: { name: 'thumb.jpg', mimeType: 'image/jpeg', buffer: fs.readFileSync(thumbFile) }
                }
            });
            expect(res.status()).toBe(400);
        });

        test('28. Subir video con extensiones inválidas falla', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos`, {
                headers: { 'Authorization': `Bearer ${userToken1}` },
                multipart: {
                    title: 'Invalid format',
                    video: { name: 'test.txt', mimeType: 'text/plain', buffer: Buffer.from('txt') },
                    thumbnail: { name: 'thumb.txt', mimeType: 'text/plain', buffer: Buffer.from('txt') }
                }
            });
            expect(res.status()).toBe(400);
        });

        test('29. Obtener todos los videos', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/videos`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(Array.isArray(body.videos)).toBeTruthy();
            expect(body.videos.length).toBeGreaterThan(0);
        });

        test('30. Obtener videos con paginación (per_page=1)', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/videos?page=1&per_page=1`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.videos.length).toBeLessThanOrEqual(1);
        });

        test('31. Obtener video por ID válido', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/videos/${videoId}`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.video.id).toBe(videoId);
        });

        test('32. Obtener video por ID inexistente', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/videos/999999`);
            expect(res.status()).toBe(404);
        });

        test('33. Obtener videos de un usuario específico', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/users/${userId1}/videos`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.videos[0].id_user).toBe(userId1);
        });

        test('34. Obtener videos de un usuario inexistente', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/users/999999/videos`);
            expect(res.status()).toBe(404);
        });

        test('35. Actualizar metadatos de video propio', async ({ request }) => {
            const res = await request.put(`${BASE_URL}/videos/${videoId}`, {
                headers: { 'Authorization': `Bearer ${userToken1}` },
                data: { title: 'Updated Title' }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.video.title).toBe('Updated Title');
        });

        test('36. Actualizar video ajeno falla (No autorizado)', async ({ request }) => {
            const res = await request.put(`${BASE_URL}/videos/${videoId}`, {
                headers: { 'Authorization': `Bearer ${userToken2}` },
                data: { title: 'Hacked Title' }
            });
            expect(res.status()).toBe(403);
        });

        test('37. Eliminar video ajeno falla (No autorizado)', async ({ request }) => {
            const res = await request.delete(`${BASE_URL}/videos/${videoId}`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(403);
        });

        test('38. Incrementar vista de video', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/${videoId}/views`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(201);
        });

        test('39. Obtener vistas de video', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/videos/${videoId}/views`);
            expect(res.status()).toBe(200);
        });
    });

    // --- BLOQUE 4: COMENTARIOS (10 Tests) ---
    test.describe('Comentarios', () => {
        test('40. Crear comentario exitoso', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/${videoId}/comments`, {
                headers: { 'Authorization': `Bearer ${userToken2}` },
                data: { content: '¡Excelente video!' }
            });
            expect(res.status()).toBe(201);
            const body = await res.json();
            expect(body.comentario.content).toBe('¡Excelente video!');
            commentId = body.comentario.id;
        });

        test('41. Crear comentario sin auth falla', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/${videoId}/comments`, {
                data: { content: 'Hack' }
            });
            expect(res.status()).toBe(401);
        });

        test('42. Crear comentario sin contenido falla', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/${videoId}/comments`, {
                headers: { 'Authorization': `Bearer ${userToken2}` },
                data: {}
            });
            expect(res.status()).toBe(400);
        });

        test('43. Crear comentario en video inexistente falla', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/999999/comments`, {
                headers: { 'Authorization': `Bearer ${userToken2}` },
                data: { content: 'Ghost' }
            });
            expect(res.status()).toBe(404);
        });

        test('44. Obtener comentarios de un video', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/comments?video_id=${videoId}`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.comentarios.length).toBeGreaterThan(0);
        });

        test('45. Obtener comentario por ID', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/comments/${commentId}`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.comentario.id).toBe(commentId);
        });

        test('46. Actualizar comentario propio', async ({ request }) => {
            const res = await request.put(`${BASE_URL}/comments/${commentId}`, {
                headers: { 'Authorization': `Bearer ${userToken2}` },
                data: { content: 'Comentario editado' }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.comentario.content).toBe('Comentario editado');
        });

        test('47. Actualizar comentario ajeno falla', async ({ request }) => {
            const res = await request.put(`${BASE_URL}/comments/${commentId}`, {
                headers: { 'Authorization': `Bearer ${userToken1}` },
                data: { content: 'Hack' }
            });
            expect(res.status()).toBe(403);
        });

        test('48. Eliminar comentario ajeno falla', async ({ request }) => {
            const res = await request.delete(`${BASE_URL}/comments/${commentId}`, {
                headers: { 'Authorization': `Bearer ${userToken1}` }
            });
            expect(res.status()).toBe(403);
        });

        test('49. Obtener comentario inexistente', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/comments/999999`);
            expect(res.status()).toBe(404);
        });
    });

    // --- BLOQUE 5: REACCIONES (8 Tests) ---
    test.describe('Reacciones', () => {
        test('50. Dar Like a un video', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/${videoId}/reactions`, {
                headers: { 'Authorization': `Bearer ${userToken2}` },
                data: { reaction_type: 'like' }
            });
            expect([200, 201]).toContain(res.status());
            const body = await res.json();
            expect(body.reaccion.reaction_type).toBe('like');
        });

        test('51. Cambiar Like a Dislike (Toggle)', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/${videoId}/reactions`, {
                headers: { 'Authorization': `Bearer ${userToken2}` },
                data: { reaction_type: 'dislike' }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.reaccion.reaction_type).toBe('dislike');
        });

        test('52. Eliminar reacción al enviar la misma', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/${videoId}/reactions`, {
                headers: { 'Authorization': `Bearer ${userToken2}` },
                data: { reaction_type: 'dislike' }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.message).toBe('Reaction removed');
        });

        test('53. Dar Like nuevamente', async ({ request }) => {
            await request.post(`${BASE_URL}/videos/${videoId}/reactions`, {
                headers: { 'Authorization': `Bearer ${userToken2}` },
                data: { reaction_type: 'like' }
            });
        });

        test('54. Obtener reacciones del video', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/videos/${videoId}/reactions`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.reacciones.length).toBeGreaterThan(0);
        });

        test('55. Reaccionar sin auth falla', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/${videoId}/reactions`, {
                data: { reaction_type: 'like' }
            });
            expect(res.status()).toBe(401);
        });

        test('56. Reaccionar con tipo inválido falla', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/${videoId}/reactions`, {
                headers: { 'Authorization': `Bearer ${userToken2}` },
                data: { reaction_type: 'love' }
            });
            expect(res.status()).toBe(400);
        });

        test('57. Reaccionar a video inexistente falla', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/999999/reactions`, {
                headers: { 'Authorization': `Bearer ${userToken2}` },
                data: { reaction_type: 'like' }
            });
            expect(res.status()).toBe(404);
        });
    });

    // --- BLOQUE 6: SUSCRIPCIONES (8 Tests) ---
    test.describe('Suscripciones', () => {
        test('58. Suscribirse a un canal', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/users/${userId1}/subscribe`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect([200, 201]).toContain(res.status());
        });

        test('59. Verificar estado is_subscribed = true', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/users/${userId1}/is_subscribed`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.suscrito).toBe(true);
        });

        test('60. Desuscribirse enviando toggle nuevamente', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/users/${userId1}/subscribe`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.message).toBe('Subscription removed');
        });

        test('61. Volver a suscribirse para tests posteriores', async ({ request }) => {
            await request.post(`${BASE_URL}/users/${userId1}/subscribe`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
        });

        test('62. Intentar suscribirse a uno mismo falla', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/users/${userId2}/subscribe`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(400);
        });

        test('63. Suscribirse a usuario inexistente', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/users/999999/subscribe`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(404);
        });

        test('64. Obtener mis suscripciones', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/subscriptions`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.suscripciones.length).toBeGreaterThan(0);
        });

        test('65. Obtener suscriptores de un usuario', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/users/${userId1}/subscribers`);
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.suscriptores.length).toBeGreaterThan(0);
        });
    });

    // --- BLOQUE 7: LISTAS PERSONALES (10 Tests) ---
    test.describe('Listas Personales', () => {
        test('66. Añadir a Ver Más Tarde', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/${videoId}/watch_later`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(201);
            const body = await res.json();
            expect(body.in_list).toBe(true);
        });

        test('67. Listar Ver Más Tarde', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/users/me/watch_later`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.videos.some((v: any) => v.id === videoId)).toBeTruthy();
        });

        test('68. Remover de Ver Más Tarde', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/${videoId}/watch_later`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.in_list).toBe(false);
        });

        test('69. Añadir a Mi Lista', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/${videoId}/my_list`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(201);
        });

        test('70. Listar Mi Lista', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/users/me/my_list`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.videos.some((v: any) => v.id === videoId)).toBeTruthy();
        });

        test('71. Remover de Mi Lista', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/${videoId}/my_list`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(200);
        });

        test('72. Listar Videos Liked', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/users/me/liked`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            // Ya le habíamos dado like en el test 53
            expect(body.videos.some((v: any) => v.id === videoId)).toBeTruthy();
        });

        test('73. Listar Videos de Suscripciones', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/users/me/subscriptions/videos`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.videos.some((v: any) => v.id === videoId)).toBeTruthy();
        });

        test('74. Listar Watch Later vacío', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/users/me/watch_later`, {
                headers: { 'Authorization': `Bearer ${userToken1}` } // Usuario 1 no tiene videos guardados
            });
            expect(res.status()).toBe(200);
            const body = await res.json();
            expect(body.videos.length).toBe(0);
        });

        test('75. Añadir a lista inexistente (video invalido)', async ({ request }) => {
            const res = await request.post(`${BASE_URL}/videos/999999/watch_later`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(404);
        });
    });

    // --- BLOQUE 8: LIMPIEZA Y SEGURIDAD / VARIOS (5 Tests) ---
    test.describe('Seguridad y Limpieza', () => {
        test('76. Eliminar comentario final', async ({ request }) => {
            const res = await request.delete(`${BASE_URL}/comments/${commentId}`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(200);
        });

        test('77. Eliminar video propio final', async ({ request }) => {
            const res = await request.delete(`${BASE_URL}/videos/${videoId}`, {
                headers: { 'Authorization': `Bearer ${userToken1}` }
            });
            expect(res.status()).toBe(200);
        });

        test('78. Eliminar usuario propio 2', async ({ request }) => {
            const res = await request.delete(`${BASE_URL}/users/${userId2}`, {
                headers: { 'Authorization': `Bearer ${userToken2}` }
            });
            expect(res.status()).toBe(200);
        });

        test('79. Petición a ruta inválida retorna 404', async ({ request }) => {
            const res = await request.get(`${BASE_URL}/ruta_inexistente`);
            expect(res.status()).toBe(404);
        });

        test('80. Método HTTP incorrecto en ruta existente retorna 405', async ({ request }) => {
            // Hacemos POST a /users en vez de GET sin body (o si existe POST, al menos falla con 400, probemos PUT a /users)
            const res = await request.put(`${BASE_URL}/users`);
            // Flask retorna 405 Method Not Allowed si el decorador no incluye PUT
            expect(res.status()).toBe(405);
        });
    });
});
