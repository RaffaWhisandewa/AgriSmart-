// ============================================
// BAHASA INDONESIA - AgriSmart Translation
// File: lang/Id.js
// ============================================

const lang_id = {
    // ==========================================
    // COMMON / GLOBAL (Dipakai di semua halaman)
    // ==========================================
    common: {
        appName: "AgriSmart",
        tagline: "Sistem Cerdas untuk Pertanian Modern",
        user: "Pengguna",
        myProfile: "Profil Saya",
        logout: "Keluar",
        save: "Simpan",
        cancel: "Batal",
        delete: "Hapus",
        edit: "Edit",
        add: "Tambah",
        search: "Cari",
        loading: "Memuat...",
        success: "Berhasil",
        error: "Gagal",
        warning: "Peringatan",
        info: "Informasi",
        confirm: "Konfirmasi",
        yes: "Ya",
        no: "Tidak",
        ok: "OK",
        close: "Tutup",
        back: "Kembali",
        next: "Selanjutnya",
        previous: "Sebelumnya",
        refresh: "Refresh",
        export: "Export",
        import: "Import",
        download: "Unduh",
        upload: "Unggah",
        status: "Status",
        active: "Aktif",
        inactive: "Tidak Aktif",
        online: "Online",
        offline: "Offline",
        connected: "Terhubung",
        disconnected: "Terputus",
        copy: "Salin",
        test: "Test",
        requiresBackend: "Fitur ini membutuhkan backend server",
        seconds: "detik",
        stayConnected: "Tetap Terhubung"
    },

    // ==========================================
    // NAVIGATION (Menu navigasi)
    // ==========================================
    nav: {
        dashboard: "Dashboard",
        monitoring: "Monitoring",
        control: "Kontrol",
        reports: "Laporan",
        settings: "Pengaturan"
    },

    // ==========================================
    // DASHBOARD PAGE (Halaman Dashboard)
    // ==========================================
    dashboard: {
        title: "AgriSmart Dashboard",
        subtitle: "Sistem Cerdas untuk Pertanian Modern",
        
        // Metric Cards
        temperature: "Suhu Udara",
        humidity: "Kelembaban Tanah",
        phLevel: "pH Tanah",
        lightIntensity: "Intensitas Cahaya",
        
        // Status
        optimal: "Optimal",
        warning: "Perhatian",
        good: "Baik",
        normal: "Normal",
        high: "Tinggi",
        low: "Rendah",
        acidic: "Asam",
        alkaline: "Basa",
        dry: "Kering",
        wet: "Basah",
        
        // Chart
        chartTitle: "Grafik Sensor Real-time",
        temperatureLabel: "Suhu (°C)",
        humidityLabel: "Kelembaban (%)",
        phLabel: "pH Tanah",
        
        // Recommendations
        recommendationsTitle: "Rekomendasi AI",
        wateringNeeded: "Penyiraman Diperlukan",
        wateringDesc: "Kelembaban tanah 69%, rekomendasikan penyiraman dalam 1 jam",
        optimalCondition: "Kondisi Optimal",
        optimalConditionDesc: "Suhu dan pH dalam rentang ideal untuk pertumbuhan",
        weatherSupport: "Cuaca Mendukung",
        weatherSupportDesc: "Intensitas cahaya cukup untuk fotosintesis optimal"
    },

    // ==========================================
    // MONITORING PAGE (Halaman Monitoring)
    // ==========================================
    monitoring: {
        title: "AgriSmart Monitoring",
        subtitle: "Sistem Cerdas untuk Pertanian Modern",
        
        // Device Status
        deviceStatus: "Status Perangkat",
        iotGateway: "Gateway IoT",
        cloudServer: "Cloud Server",
        sensorAreaC: "Sensor Area C",
        lastUpdate: "Update Terakhir",
        signal: "Sinyal",
        latency: "Latensi",
        storage: "Penyimpanan",
        used: "terpakai",
        battery: "Baterai",
        needReplacement: "Perlu penggantian",
        
        // Pump Status
        pumpStatus: "Status Pompa",
        pump1: "Pompa 1",
        pump2: "Pompa 2",
        mode: "Mode",
        modeManual: "Manual",
        modeAuto: "Otomatis",
        
        // Air & Soil
        airTemperature: "Suhu Udara",
        airHumidity: "Sensor Kelembaban",
        soilMoisture: "Kelembaban Tanah",
        
        // Sensors
        temperatureSensor: "Sensor Suhu",
        humiditySensor: "Sensor Kelembaban",
        soilMoistureSensor: "Sensor Kelembaban Tanah",
        phSensor: "Sensor pH Tanah",
        lightSensor: "Sensor Cahaya",
        
        // Areas
        areaA: "Area A",
        areaB: "Area B",
        areaC: "Area C",
        area1: "Area 1",
        area2: "Area 2",
        
        // Chart
        realtimeChart: "Real-time Monitoring Chart",
        live: "LIVE",
        pause: "Pause",
        play: "Play",
        average: "Rata-rata",
        highest: "Tertinggi",
        lowest: "Terendah",
        lastSync: "Sinkronisasi Terakhir",
        
        // Time Range
        hour: "Jam",
        hours: "Jam",
        
        // Sensor Types (untuk dropdown)
        sensorTemperature: "Suhu",
        sensorHumidity: "Kelembaban",
        sensorPh: "pH",
        sensorLight: "Cahaya",
        
        // Time options
        time24h: "24 Jam",
        time12h: "12 Jam",
        time6h: "6 Jam",
        time1h: "1 Jam",
        
        // Status
        secondsAgo: "detik lalu",
        seconds: "detik",
        
        // ESP32 Info Bar
        interval: "Interval",
        uptime: "Uptime",
        connectionType: "Koneksi",
        
        // pH Scale
        acidic: "Asam",
        alkaline: "Basa"
    },

    // ==========================================
    // CONTROL PAGE (Halaman Kontrol)
    // ==========================================
    control: {
        title: "AgriSmart Kontrol Sistem",
        subtitle: "Manajemen Perangkat dan Otomasi",
        
        // Camera
        cameraTitle: "Live Camera Feed",
        connectingCamera: "Menghubungkan ke kamera...",
        refresh: "Refresh",
        capture: "Capture",
        pause: "Pause",
        play: "Play",
        resolution: "Resolusi",
        fps: "FPS",
        cameraStatus: "Status",
        connecting: "Menghubungkan",
        streaming: "Streaming",
        paused: "Dijeda",
        cameraError: "Error",
        
        // Camera Settings
        cameraSettings: "Pengaturan Kamera",
        xclkMhz: "XCLK MHz",
        resolution: "Resolusi",
        quality: "Kualitas",
        brightness: "Kecerahan",
        contrast: "Kontras",
        saturation: "Saturasi",
        specialEffect: "Efek Khusus",
        noEffect: "Tanpa Efek",
        negative: "Negatif",
        grayscale: "Grayscale",
        redTint: "Tint Merah",
        greenTint: "Tint Hijau",
        blueTint: "Tint Biru",
        ledIntensity: "Intensitas LED",
        resetToDefault: "Reset ke Default",
        saveSettings: "Simpan Pengaturan",
        
        // Watering Control
        wateringControl: "Kontrol Penyiraman",
        autoMode: "Mode Otomatis",
        autoModeDesc: "Penyiraman berdasarkan kelembaban tanah",
        scheduledWatering: "Jadwal Penyiraman",
        scheduledWateringDesc: "Pagi: 06:00, Sore: 17:00",
        manualWatering: "Penyiraman Manual",
        manualWateringDesc: "Kontrol langsung untuk semua area",
        startWatering: "Mulai Penyiraman",
        stopWatering: "Hentikan Penyiraman",
        
        // Fertilizing Control
        fertilizingControl: "Kontrol Pemupukan",
        autoFertilizing: "Sistem Pemupukan Otomatis",
        autoFertilizingDesc: "Berdasarkan analisis pH dan nutrisi",
        scheduledFertilizing: "Jadwal Pemupukan",
        scheduledFertilizingDesc: "Setiap 3 hari sekali",
        manualFertilizing: "Pemupukan Manual",
        manualFertilizingDesc: "Kontrol langsung aplikasi pupuk",
        startFertilizing: "Mulai Pemupukan",
        stopFertilizing: "Hentikan Pemupukan",
        
        // Environment Control
        environmentControl: "Kontrol Lingkungan",
        ventilation: "Ventilasi Greenhouse",
        ventilationDesc: "Kontrol suhu dan sirkulasi udara",
        shadingSystem: "Shading System",
        shadingSystemDesc: "Perlindungan dari sinar matahari berlebih",
        heatingSystem: "Heating System",
        heatingSystemDesc: "Pemanas untuk suhu malam hari"
    },

    // ==========================================
    // REPORTS PAGE (Halaman Laporan)
    // ==========================================
    reports: {
        title: "AgriSmart Laporan & Analisis",
        subtitle: "Data Historis dan Insight Pertanian",
        
        // Weekly Summary
        weeklySummary: "Ringkasan Mingguan",
        waterUsed: "Air Terpakai",
        fertilizerUsed: "Pupuk Digunakan",
        systemUptime: "Uptime Sistem",
        avgTemperature: "Suhu Rata-rata",
        
        // Charts
        monthlyProductivity: "Analisis Produktivitas Bulanan",
        resourceTrend: "Trend Konsumsi Sumber Daya",
        productivity: "Produktivitas (%)",
        water: "Air (Liter)",
        fertilizer: "Pupuk (kg)",
        week1: "Minggu 1",
        week2: "Minggu 2",
        week3: "Minggu 3",
        week4: "Minggu 4",
        
        // AI Predictions
        aiPredictions: "Prediksi AI & Rekomendasi",
        harvestPrediction: "Prediksi Hasil Panen",
        harvestPredictionDesc: "Berdasarkan data historis, estimasi hasil panen meningkat 12% dari bulan lalu",
        fertilizingRecommendation: "Rekomendasi Pemupukan",
        fertilizingRecommendationDesc: "Area C memerlukan tambahan nitrogen. Rekomendasi: aplikasi pupuk NPK 15-15-15",
        waterEfficiency: "Efisiensi Air",
        waterEfficiencyDesc: "Penggunaan air 8% lebih efisien dibanding periode sebelumnya",
        
        // Export
        exportData: "Export Data",
        exportDesc: "Download laporan dalam berbagai format untuk analisis lebih lanjut",
        exportPDF: "Export PDF",
        exportExcel: "Export Excel",
        exportCSV: "Export CSV",
        exportingPDF: "Mengeksport laporan dalam format PDF...",
        exportingExcel: "Mengeksport laporan dalam format Excel...",
        exportingCSV: "Mengeksport laporan dalam format CSV...",
        exportSuccess: "Laporan berhasil dieksport dalam format"
    },

    // ==========================================
    // SETTINGS PAGE (Halaman Pengaturan)
    // ==========================================
    settings: {
        title: "AgriSmart Pengaturan Sistem",
        subtitle: "Pengaturan Sistem - Konfigurasi dan Personalisasi",
        
        // Device Management
        deviceManagement: "Kelola Perangkat",
        howToAddDevice: "Cara Menambahkan Perangkat:",
        step1: "Upload kode ke ESP32/ESP32-CAM",
        step2: "Buka Serial Monitor (115200 baud)",
        step3: "Catat Device ID yang muncul (contoh: SPR-A1B2C3D4E5F6)",
        step4: "Masukkan Device ID di form bawah ini",
        deviceIdInfo: "Device ID berbasis MAC Address, unik dan tidak akan berubah meski perangkat di-reset.",
        yourUserId: "User ID Anda",
        userIdHint: "User ID ini diperlukan saat konfigurasi perangkat ESP32 (ketik SETUSER:<UserID> di Serial Monitor)",
        
        // Device Categories
        sprinklerDevice: "Alat Penyiram (ESP32)",
        cameraDevice: "Kamera (ESP32-CAM)",
        addSprinkler: "Tambah Penyiram",
        addCamera: "Tambah Kamera",
        addFirstSprinkler: "Tambah Penyiram Pertama",
        addFirstCamera: "Tambah Kamera Pertama",
        noSprinklerConnected: "Belum ada alat penyiram yang terhubung",
        noCameraConnected: "Belum ada kamera yang terhubung",
        
        // Device Form
        deviceId: "Device ID",
        deviceName: "Nama Perangkat",
        deviceLocation: "Lokasi",
        ipAddress: "IP Address",
        enterDeviceId: "Masukkan 12 karakter",
        deviceIdHint: "Masukkan 12 karakter Device ID dari Serial Monitor (contoh: A1B2C3D4E5F6)",
        deviceNamePlaceholder: "Contoh: Penyiram Kebun A",
        locationPlaceholder: "Contoh: Kebun Belakang",
        ipPlaceholder: "Contoh: 192.168.1.100",
        ipHint: "Alamat IP perangkat di jaringan lokal Anda",
        deviceIdReadonly: "Device ID tidak dapat diubah (berbasis MAC Address)",
        addDevice: "Tambah Perangkat",
        saveChanges: "Simpan Perubahan",
        deleteDeviceBtn: "Hapus Perangkat",
        locationOptional: "Lokasi (Opsional)",
        ipOptional: "IP Address (Opsional)",
        
        // Device Actions
        editDevice: "Edit Perangkat",
        deleteDevice: "Hapus Perangkat",
        confirmDelete: "Konfirmasi Hapus",
        deleteMessage: "Apakah Anda yakin ingin menghapus perangkat ini?",
        deleteWarning: "Tindakan ini tidak dapat dibatalkan.",
        
        // IoT Connection
        iotConnection: "Pengaturan Koneksi IoT",
        esp32IpDefault: "IP Address ESP32 Default",
        esp32IpDesc: "Alamat IP default untuk ESP32 baru",
        websocketPort: "WebSocket Port",
        websocketPortDesc: "Port WebSocket untuk komunikasi real-time (default: 81)",
        
        // General Settings
        generalSettings: "Pengaturan Umum",
        darkMode: "Mode Gelap",
        darkModeDesc: "Aktifkan tema gelap untuk mengurangi kelelahan mata",
        language: "Bahasa Sistem",
        languageDesc: "Pilih bahasa yang ingin digunakan",
        timezone: "Zona Waktu",
        timezoneDesc: "Atur zona waktu sesuai lokasi Anda",
        
        // Languages
        indonesian: "Bahasa Indonesia",
        english: "English",
        
        // Timezones
        wib: "WIB (GMT+7)",
        wita: "WITA (GMT+8)",
        wit: "WIT (GMT+9)",
        
        // Sensor Settings
        sensorSettings: "Pengaturan Sensor",
        sensorInterval: "Interval Pembacaan Sensor",
        sensorIntervalDesc: "Seberapa sering sensor membaca data (detik)",
        autoCalibration: "Kalibrasi Otomatis",
        autoCalibrationDesc: "Aktifkan kalibrasi sensor otomatis setiap hari",
        
        // Threshold Settings
        thresholdSettings: "Pengaturan Threshold",
        autoWateringThreshold: "Threshold Penyiraman Otomatis",
        thresholdInfo: "Atur batas kelembaban tanah untuk mengontrol penyiraman otomatis. Pompa akan MENYALA jika kelembaban di bawah threshold kering, dan MATI jika kelembaban mencapai threshold basah.",
        humidityThreshold: "Threshold Kelembaban",
        humidityDry: "Threshold Kelembaban Kering",
        humidityDryDesc: "Pompa menyala jika kelembaban tanah di bawah nilai ini",
        humidityWet: "Threshold Kelembaban Basah",
        humidityWetDesc: "Pompa mati jika kelembaban tanah mencapai nilai ini",
        phThreshold: "Threshold pH",
        phThresholdTitle: "Threshold pH Tanah",
        phAcidic: "Batas pH Asam",
        phAcidicDesc: "Alert jika pH tanah di bawah nilai ini (terlalu asam)",
        phAlkaline: "Batas pH Basa",
        phAlkalineDesc: "Alert jika pH tanah di atas nilai ini (terlalu basa)",
        zoneDry: "Kering",
        zoneOptimal: "Optimal",
        zoneWet: "Basah",
        
        // Notification Settings
        notificationSettings: "Pengaturan Notifikasi",
        emailNotification: "Notifikasi Email",
        emailNotificationDesc: "Terima notifikasi penting melalui email",
        pushNotification: "Notifikasi Push Browser",
        pushNotificationDesc: "Terima notifikasi push di browser saat ada alert",
        
        // Security Settings
        securitySettings: "Pengaturan Keamanan",
        twoFactor: "Autentikasi Dua Faktor",
        twoFactorDesc: "Tingkatkan keamanan dengan verifikasi dua langkah",
        sessionTimeout: "Timeout Sesi",
        sessionTimeoutDesc: "Waktu otomatis logout jika tidak ada aktivitas",
        minutes: "Menit",
        hour: "Jam",
        hours: "Jam",
        
        // Buttons
        saveSettings: "Simpan Pengaturan",
        exportSettings: "Export Pengaturan",
        resetSettings: "Reset ke Default",
        
        // Messages
        settingsSaved: "Pengaturan berhasil disimpan!",
        settingsExported: "Pengaturan berhasil diexport!",
        settingsReset: "Pengaturan berhasil direset ke default!",
        confirmReset: "Apakah Anda yakin ingin mereset semua pengaturan ke default?",
        testConnection: "Test Koneksi",
        connectionSuccess: "ESP32 terhubung!",
        connectionFailed: "Koneksi gagal",
        
        // Language change notification
        languageChanged: "Bahasa berhasil diubah ke Bahasa Indonesia"
    },

    // ==========================================
    // LOGIN PAGE (Halaman Login)
    // ==========================================
    login: {
        title: "PlantCare - Login & Daftar",
        loginTitle: "Masuk ke PlantCare",
        loginSubtitle: "Kelola tanaman kesayangan Anda",
        registerTitle: "Bergabung dengan PlantCare",
        registerSubtitle: "Mulai perjalanan berkebun Anda hari ini",
        
        // Form Fields
        email: "Email",
        password: "Password",
        confirmPassword: "Konfirmasi Password",
        fullName: "Nama Lengkap",
        rememberMe: "Ingat saya",
        forgotPassword: "Lupa password?",
        
        // Buttons
        loginButton: "Masuk",
        registerButton: "Daftar Sekarang",
        
        // Switch Forms
        noAccount: "Belum punya akun?",
        registerNow: "Daftar Sekarang",
        hasAccount: "Sudah punya akun?",
        loginHere: "Masuk Di Sini",
        
        // Terms
        agreeTerms: "Saya setuju dengan",
        termsConditions: "Syarat & Ketentuan",
        
        // Messages
        loginSuccess: "Login berhasil!",
        loginFailed: "Email atau password salah!",
        registerSuccess: "Pendaftaran berhasil!",
        registerFailed: "Pendaftaran gagal!",
        passwordMismatch: "Password tidak cocok!",
        emailRequired: "Email harus diisi!",
        passwordRequired: "Password harus diisi!",
        nameRequired: "Nama lengkap harus diisi!",
        passwordMinLength: "Password minimal 6 karakter!",
        emailExists: "Email sudah terdaftar!",
        agreeTermsRequired: "Anda harus menyetujui syarat & ketentuan!",
        processing: "Memproses..."
    },

    // ==========================================
    // NOTIFICATIONS (Toast messages)
    // ==========================================
    notifications: {
        deviceAdded: "Perangkat berhasil ditambahkan!",
        deviceUpdated: "Perangkat berhasil diperbarui!",
        deviceDeleted: "Perangkat berhasil dihapus!",
        deviceIdRequired: "Device ID harus 12 karakter",
        deviceIdHexOnly: "Device ID hanya boleh berisi karakter hex (0-9, A-F)",
        deviceNameRequired: "Nama perangkat harus diisi",
        deviceAlreadyExists: "Device ID sudah terdaftar",
        userIdCopied: "User ID berhasil disalin!",
        settingsSaved: "Pengaturan berhasil disimpan!",
        settingsFailed: "Gagal menyimpan pengaturan!",
        connectionTesting: "Menguji koneksi ke",
        connectionSuccess: "Koneksi berhasil!",
        connectionFailed: "Koneksi gagal!",
        connectionTimeout: "Timeout: ESP32 tidak merespons"
    },

    // ==========================================
    // PROFILE PAGE (Halaman Profil)
    // ==========================================
    profile: {
        title: "Profil Saya",
        subtitle: "Kelola Informasi Akun Anda",
        
        // Profile Header
        userId: "ID",
        copyUserId: "Salin User ID",
        userIdCopied: "User ID berhasil disalin!",
        farmer: "Petani",
        researcher: "Peneliti",
        student: "Pelajar",
        hobbyist: "Hobi",
        
        // Form Labels
        fullName: "Nama Lengkap",
        email: "Email",
        phone: "Nomor HP",
        birthplace: "Tempat Lahir",
        birthdate: "Tanggal Lahir",
        farmingField: "Bidang Pertanian",
        address: "Alamat Kebun/Lahan",
        memberSince: "Bergabung Sejak",
        
        // Form Placeholders
        fullNamePlaceholder: "Masukkan nama lengkap",
        emailPlaceholder: "contoh@email.com",
        phonePlaceholder: "08xxxxxxxxxx",
        birthplacePlaceholder: "Kota kelahiran",
        addressPlaceholder: "Masukkan alamat lengkap kebun atau lahan pertanian Anda",
        customFieldPlaceholder: "Sebutkan bidang pertanian Anda",
        
        // Form Hints
        emailHint: "Email tidak dapat diubah",
        phoneHint: "Contoh: 081234567890",
        addressHint: "Alamat lokasi pertanian Anda (opsional)",
        
        // Farming Fields
        chili: "Cabai",
        tomato: "Tomat",
        eggplant: "Terong",
        rice: "Padi",
        corn: "Jagung",
        vegetables: "Sayuran",
        fruits: "Buah-buahan",
        others: "Lainnya",
        
        // Buttons
        editProfile: "Edit Profil",
        saveChanges: "Simpan Perubahan",
        cancel: "Batal",
        changePassword: "Ubah Sandi",
        
        // Stats Card
        statsTitle: "Statistik Akun",
        daysJoined: "Hari Bergabung",
        farmingFields: "Bidang Pertanian",
        accountStatus: "Status Akun",
        active: "Aktif",
        
        // Quick Actions
        quickActionsTitle: "Aksi Cepat",
        dashboard: "Dashboard",
        control: "Kontrol",
        settings: "Pengaturan",
        
        // Change Password Modal
        changePasswordTitle: "Ubah Kata Sandi",
        currentPassword: "Kata Sandi Saat Ini",
        newPassword: "Kata Sandi Baru",
        confirmNewPassword: "Konfirmasi Kata Sandi Baru",
        
        // Messages
        profileUpdated: "Profil berhasil diperbarui!",
        profileUpdateFailed: "Terjadi kesalahan saat memperbarui profil",
        passwordChanged: "Kata sandi berhasil diubah!",
        passwordChangeFailed: "Gagal mengubah kata sandi",
        passwordMismatch: "Kata sandi baru tidak cocok",
        passwordTooShort: "Kata sandi minimal 8 karakter",
        currentPasswordWrong: "Kata sandi saat ini salah",
        
        // Validation
        nameRequired: "Nama lengkap harus diisi",
        emailRequired: "Email harus diisi",
        emailInvalid: "Format email tidak valid",
        
        // Profile Badge
        fieldLabel: "Bidang:"
    },

    // ==========================================
    // AUTH PAGES (Login, Register, CompleteProfile)
    // ==========================================
    auth: {
        // Login
        loginTitle: "AgriSmart",
        loginSubtitle: "Masuk ke Dashboard Pertanian Cerdas",
        email: "Email",
        password: "Kata Sandi",
        emailPlaceholder: "contoh@email.com",
        passwordPlaceholder: "Masukkan kata sandi",
        rememberMe: "Ingat saya",
        forgotPassword: "Lupa kata sandi?",
        loginButton: "Masuk",
        orDivider: "atau",
        googleLogin: "Masuk dengan Google",
        noAccount: "Belum punya akun?",
        registerNow: "Daftar Sekarang",
        
        // Register
        registerTitle: "AgriSmart",
        registerSubtitle: "Bergabung dengan Pertanian Cerdas",
        fullName: "Nama Lengkap",
        fullNamePlaceholder: "Masukkan nama lengkap",
        phone: "Nomor HP",
        phonePlaceholder: "08xxxxxxxxxx",
        phoneHint: "Contoh: 081234567890",
        birthplace: "Tempat Lahir",
        birthplacePlaceholder: "Kota kelahiran",
        birthdate: "Tanggal Lahir",
        farmingField: "Petani di Bidang Apa?",
        address: "Alamat Kebun/Lahan (Opsional)",
        addressPlaceholder: "Alamat lokasi pertanian Anda",
        confirmPassword: "Konfirmasi Kata Sandi",
        confirmPasswordPlaceholder: "Ulangi kata sandi",
        passwordMinimal: "Minimal 8 karakter",
        passwordHint: "Gunakan minimal 8 karakter dengan huruf dan angka",
        agreeTerms: "Saya setuju dengan",
        termsAndConditions: "Syarat & Ketentuan",
        registerButton: "Daftar Sekarang",
        haveAccount: "Sudah punya akun?",
        loginHere: "Masuk Di Sini",
        
        // Complete Profile
        completeProfileTitle: "AgriSmart",
        completeProfileSubtitle: "Lengkapi Data untuk Memulai Pertanian Cerdas",
        googleBadge: "Google",
        customFieldPlaceholder: "Sebutkan bidang pertanian Anda",
        saveAndContinue: "Simpan & Lanjutkan",
        useAnotherAccount: "Ingin menggunakan akun lain?",
        logout: "Keluar",
        
        // Farming Fields
        chili: "Cabai",
        tomato: "Tomat",
        eggplant: "Terong",
        rice: "Padi",
        corn: "Jagung",
        vegetables: "Sayuran",
        fruits: "Buah-buahan",
        others: "Lainnya",
        
        // Common
        required: "*",
        
        // Messages
        loginSuccess: "Login berhasil! Mengalihkan...",
        loginError: "Email atau kata sandi salah",
        registerSuccess: "Pendaftaran berhasil!",
        registerError: "Terjadi kesalahan saat mendaftar",
        profileCompleteSuccess: "Profil berhasil dilengkapi!",
        profileCompleteError: "Terjadi kesalahan",
        passwordMismatch: "Kata sandi tidak cocok",
        fillAllFields: "Harap isi semua field yang wajib",
        agreeTermsRequired: "Anda harus menyetujui syarat & ketentuan",
        
        // Success Modal (Register)
        congratulations: "Selamat!",
        registrationComplete: "Pendaftaran Berhasil",
        accountCreated: "Akun Anda telah berhasil dibuat",
        yourInfo: "Informasi Anda:",
        name: "Nama",
        proceedToDashboard: "Lanjut ke Dashboard",
        
        // Password Strength
        passwordWeak: "Lemah",
        passwordMedium: "Sedang",
        passwordStrong: "Kuat"
    }
};

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = lang_id;
}