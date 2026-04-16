// Datos de prueba hechos con IA para implementar funcionalidad de prueba
const mockUsers = [
    {
        id: 1,
        username: "streamix_user",
        email: "user@streamix.com",
        password: "password123",
        created_at: new Date().toISOString()
    }
];

const mockVideos = [
    {
        id: 1,
        title: "Bacilos - Tabaco y Chanel (Official Music Video)",
        description: "Canciones legendarias que marcaron generaciones. Perfecto para cantar, bailar o recordar los mejores momentos de la música latina.",
        created_at: new Date().toISOString(),
        id_user: 1,
        thumbnail: "https://i.ytimg.com/vi/6JqnbsQpljU/hqdefault.jpg?sqp=-oaymwEjCPYBEIoBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLDgy8JfxRIHzrzgFjldn53H4P_dRA",
        link: "6JqnbsQpljU"
    },
    {
        id: 2,
        title: "Andres Calamaro - Flaca (Video clip)",
        description: "Ya puedes conseguir el nuevo álbum de Andrés Calamaro aquí: http://goo.gl/7zOCWB Escúchalo en Spotify: http://goo.gl/DjJNJt",
        created_at: new Date().toISOString(),
        id_user: 1,
        thumbnail: "https://i.ytimg.com/vi/CG7rVuIZugU/hqdefault.jpg?sqp=-oaymwEjCPYBEIoBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLAvBYo9latQwGrwf_G54VepnOid2Q",
        link: "CG7rVuIZugU"
    },
    {
        id: 3,
        title: "Pablo Alborán - Te he echado de menos (Videoclip oficial)",
        description: "Music video by Pablo Alboran performing Te he echado de menos. (P) 2012 The copyright in this audiovisual recording is owned by Trimeca Estudios y Producciones S.L. Under exclusive lisence to EMI Music Spain, S.A.",
        created_at: new Date().toISOString(),
        id_user: 1,
        thumbnail: "https://i.ytimg.com/vi/cSUEFDZ3p3k/hqdefault.jpg?sqp=-oaymwEjCPYBEIoBSFryq4qpAxUIARUAAAAAGAElAADIQj0AgKJDeAE=&rs=AOn4CLAV0hUHEjD9wq715Yy9y_ZrpH2y8g",
        link: "cSUEFDZ3p3k"
    }
];

// Función sleep para simular tiempo de retraso con el servidor
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para simular login
export const mockLogin = async (emailOrUsername, password) => {
    await sleep(800);

    const user = mockUsers.find(
        u => u.password === password && (u.username === emailOrUsername || u.email === emailOrUsername)
    );

    if (!user) {
        throw new Error("Usuario o contraseña incorrectos");
    }

    const { password: _, ...userData } = user;
    return {
        success: true,
        msg: "Login exitoso",
        data: userData,
        token: `fake-jwt-token-user-${userData.id}`
    };
};

// Función para simular registro
export const mockRegister = async (username, email, password) => {
    await sleep(800);

    const userExists = mockUsers.some(u => u.username === username || u.email === email);
    if (userExists) {
        throw new Error("El username o email ya están en uso");
    }

    const newUser = {
        id: mockUsers.length + 1,
        username,
        email,
        password,
        created_at: new Date().toISOString()
    };
    mockUsers.push(newUser);

    const { password: _, ...userData } = newUser;
    return {
        success: true,
        msg: "Registrado correctamente",
        data: userData,
        token: `fake-jwt-token-user-${newUser.id}`
    };
};

// Función para simular obtener videos
export const mockFetchVideos = async () => {
    await sleep(500);

    return {
        success: true,
        data: mockVideos
    };
};

// Función para simular obtener un solo video por id
export const mockGetVideo = async (id) => {
    await sleep(500);

    const video = mockVideos.find(v => v.id === parseInt(id));

    if (!video) {
        throw new Error("Video no encontrado");
    }

    return {
        success: true,
        data: video
    };
};
