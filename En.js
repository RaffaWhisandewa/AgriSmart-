// ============================================
// ENGLISH - AgriSmart Translation
// File: lang/En.js
// ============================================

const lang_en = {
    // ==========================================
    // COMMON / GLOBAL (Used on all pages)
    // ==========================================
    common: {
        appName: "AgriSmart",
        tagline: "Smart System for Modern Agriculture",
        user: "User",
        myProfile: "My Profile",
        logout: "Logout",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        add: "Add",
        search: "Search",
        loading: "Loading...",
        success: "Success",
        error: "Error",
        warning: "Warning",
        info: "Information",
        confirm: "Confirm",
        yes: "Yes",
        no: "No",
        ok: "OK",
        close: "Close",
        back: "Back",
        next: "Next",
        previous: "Previous",
        refresh: "Refresh",
        export: "Export",
        import: "Import",
        download: "Download",
        upload: "Upload",
        status: "Status",
        active: "Active",
        inactive: "Inactive",
        online: "Online",
        offline: "Offline",
        connected: "Connected",
        disconnected: "Disconnected",
        copy: "Copy",
        test: "Test",
        requiresBackend: "This feature requires backend server",
        seconds: "seconds",
        stayConnected: "Stay Connected"
    },

    // ==========================================
    // NAVIGATION (Navigation menu)
    // ==========================================
    nav: {
        dashboard: "Dashboard",
        monitoring: "Monitoring",
        control: "Control",
        reports: "Reports",
        settings: "Settings"
    },

    // ==========================================
    // DASHBOARD PAGE
    // ==========================================
    dashboard: {
        title: "AgriSmart Dashboard",
        subtitle: "Smart System for Modern Agriculture",
        
        // Metric Cards
        temperature: "Air Temperature",
        humidity: "Soil Moisture",
        phLevel: "Soil pH",
        lightIntensity: "Light Intensity",
        
        // Status
        optimal: "Optimal",
        warning: "Warning",
        good: "Good",
        normal: "Normal",
        high: "High",
        low: "Low",
        acidic: "Acidic",
        alkaline: "Alkaline",
        dry: "Dry",
        wet: "Wet",
        
        // Chart
        chartTitle: "Real-time Sensor Graph",
        temperatureLabel: "Temperature (°C)",
        humidityLabel: "Humidity (%)",
        phLabel: "Soil pH",
        
        // Recommendations
        recommendationsTitle: "AI Recommendations",
        wateringNeeded: "Watering Required",
        wateringDesc: "Soil moisture at 69%, watering recommended within 1 hour",
        optimalCondition: "Optimal Condition",
        optimalConditionDesc: "Temperature and pH are in the ideal range for growth",
        weatherSupport: "Weather Supportive",
        weatherSupportDesc: "Light intensity is sufficient for optimal photosynthesis"
    },

    // ==========================================
    // MONITORING PAGE
    // ==========================================
    monitoring: {
        title: "AgriSmart Monitoring",
        subtitle: "Smart System for Modern Agriculture",
        
        // Device Status
        deviceStatus: "Device Status",
        iotGateway: "IoT Gateway",
        cloudServer: "Cloud Server",
        sensorAreaC: "Sensor Area C",
        lastUpdate: "Last Update",
        signal: "Signal",
        latency: "Latency",
        storage: "Storage",
        used: "used",
        battery: "Battery",
        needReplacement: "Needs replacement",
        
        // Pump Status
        pumpStatus: "Pump Status",
        pump1: "Pump 1",
        pump2: "Pump 2",
        mode: "Mode",
        modeManual: "Manual",
        modeAuto: "Auto",
        
        // Air & Soil
        airTemperature: "Air Temperature",
        airHumidity: "Humidity Sensor",
        soilMoisture: "Soil Moisture",
        
        // Sensors
        temperatureSensor: "Temperature Sensor",
        humiditySensor: "Humidity Sensor",
        soilMoistureSensor: "Soil Moisture Sensor",
        phSensor: "Soil pH Sensor",
        lightSensor: "Light Sensor",
        
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
        average: "Average",
        highest: "Highest",
        lowest: "Lowest",
        lastSync: "Last Sync",
        
        // Time Range
        hour: "Hour",
        hours: "Hours",
        
        // Sensor Types (for dropdown)
        sensorTemperature: "Temperature",
        sensorHumidity: "Humidity",
        sensorPh: "pH",
        sensorLight: "Light",
        
        // Time options
        time24h: "24 Hours",
        time12h: "12 Hours",
        time6h: "6 Hours",
        time1h: "1 Hour",
        
        // Status
        secondsAgo: "seconds ago",
        seconds: "seconds",
        
        // ESP32 Info Bar
        interval: "Interval",
        uptime: "Uptime",
        connectionType: "Connection",
        
        // pH Scale
        acidic: "Acidic",
        alkaline: "Alkaline"
    },

    // ==========================================
    // CONTROL PAGE
    // ==========================================
    control: {
        title: "AgriSmart Control System",
        subtitle: "Device Management and Automation",
        
        // Camera
        cameraTitle: "Live Camera Feed",
        connectingCamera: "Connecting to camera...",
        refresh: "Refresh",
        capture: "Capture",
        pause: "Pause",
        play: "Play",
        resolution: "Resolution",
        fps: "FPS",
        cameraStatus: "Status",
        connecting: "Connecting",
        streaming: "Streaming",
        paused: "Paused",
        cameraError: "Error",
        
        // Camera Settings
        cameraSettings: "Camera Settings",
        xclkMhz: "XCLK MHz",
        resolution: "Resolution",
        quality: "Quality",
        brightness: "Brightness",
        contrast: "Contrast",
        saturation: "Saturation",
        specialEffect: "Special Effect",
        noEffect: "No Effect",
        negative: "Negative",
        grayscale: "Grayscale",
        redTint: "Red Tint",
        greenTint: "Green Tint",
        blueTint: "Blue Tint",
        ledIntensity: "LED Intensity",
        resetToDefault: "Reset to Default",
        saveSettings: "Save Settings",
        
        // Watering Control
        wateringControl: "Watering Control",
        autoMode: "Automatic Mode",
        autoModeDesc: "Watering based on soil moisture",
        scheduledWatering: "Scheduled Watering",
        scheduledWateringDesc: "Morning: 06:00, Evening: 17:00",
        manualWatering: "Manual Watering",
        manualWateringDesc: "Direct control for all areas",
        startWatering: "Start Watering",
        stopWatering: "Stop Watering",
        
        // Fertilizing Control
        fertilizingControl: "Fertilizing Control",
        autoFertilizing: "Automatic Fertilizing System",
        autoFertilizingDesc: "Based on pH and nutrient analysis",
        scheduledFertilizing: "Scheduled Fertilizing",
        scheduledFertilizingDesc: "Every 3 days",
        manualFertilizing: "Manual Fertilizing",
        manualFertilizingDesc: "Direct control for fertilizer application",
        startFertilizing: "Start Fertilizing",
        stopFertilizing: "Stop Fertilizing",
        
        // Environment Control
        environmentControl: "Environment Control",
        ventilation: "Greenhouse Ventilation",
        ventilationDesc: "Temperature and air circulation control",
        shadingSystem: "Shading System",
        shadingSystemDesc: "Protection from excessive sunlight",
        heatingSystem: "Heating System",
        heatingSystemDesc: "Heater for nighttime temperature"
    },

    // ==========================================
    // REPORTS PAGE
    // ==========================================
    reports: {
        title: "AgriSmart Reports & Analysis",
        subtitle: "Historical Data and Agricultural Insights",
        
        // Weekly Summary
        weeklySummary: "Weekly Summary",
        waterUsed: "Water Used",
        fertilizerUsed: "Fertilizer Used",
        systemUptime: "System Uptime",
        avgTemperature: "Average Temperature",
        
        // Charts
        monthlyProductivity: "Monthly Productivity Analysis",
        resourceTrend: "Resource Consumption Trend",
        productivity: "Productivity (%)",
        water: "Water (Liters)",
        fertilizer: "Fertilizer (kg)",
        week1: "Week 1",
        week2: "Week 2",
        week3: "Week 3",
        week4: "Week 4",
        
        // AI Predictions
        aiPredictions: "AI Predictions & Recommendations",
        harvestPrediction: "Harvest Prediction",
        harvestPredictionDesc: "Based on historical data, estimated harvest yield increased by 12% from last month",
        fertilizingRecommendation: "Fertilizing Recommendation",
        fertilizingRecommendationDesc: "Area C needs additional nitrogen. Recommendation: apply NPK 15-15-15 fertilizer",
        waterEfficiency: "Water Efficiency",
        waterEfficiencyDesc: "Water usage is 8% more efficient compared to the previous period",
        
        // Export
        exportData: "Export Data",
        exportDesc: "Download reports in various formats for further analysis",
        exportPDF: "Export PDF",
        exportExcel: "Export Excel",
        exportCSV: "Export CSV",
        exportingPDF: "Exporting report in PDF format...",
        exportingExcel: "Exporting report in Excel format...",
        exportingCSV: "Exporting report in CSV format...",
        exportSuccess: "Report successfully exported in"
    },

    // ==========================================
    // SETTINGS PAGE
    // ==========================================
    settings: {
        title: "AgriSmart Settings",
        subtitle: "System Settings - Configuration and Personalization",
        
        // Device Management
        deviceManagement: "Device Management",
        howToAddDevice: "How to Add Device:",
        step1: "Upload code to ESP32/ESP32-CAM",
        step2: "Open Serial Monitor (115200 baud)",
        step3: "Note the Device ID that appears (e.g.: SPR-A1B2C3D4E5F6)",
        step4: "Enter Device ID in the form below",
        deviceIdInfo: "Device ID is based on MAC Address, unique and won't change even if device is reset.",
        yourUserId: "Your User ID",
        userIdHint: "This User ID is required when configuring ESP32 device (type SETUSER:<UserID> in Serial Monitor)",
        
        // Device Categories
        sprinklerDevice: "Sprinkler Device (ESP32)",
        cameraDevice: "Camera (ESP32-CAM)",
        addSprinkler: "Add Sprinkler",
        addCamera: "Add Camera",
        addFirstSprinkler: "Add First Sprinkler",
        addFirstCamera: "Add First Camera",
        noSprinklerConnected: "No sprinkler devices connected",
        noCameraConnected: "No cameras connected",
        
        // Device Form
        deviceId: "Device ID",
        deviceName: "Device Name",
        deviceLocation: "Location",
        ipAddress: "IP Address",
        enterDeviceId: "Enter 12 characters",
        deviceIdHint: "Enter 12 characters Device ID from Serial Monitor (e.g.: A1B2C3D4E5F6)",
        deviceNamePlaceholder: "e.g.: Garden Sprinkler A",
        locationPlaceholder: "e.g.: Backyard",
        ipPlaceholder: "e.g.: 192.168.1.100",
        ipHint: "Device IP address on your local network",
        deviceIdReadonly: "Device ID cannot be changed (MAC Address based)",
        addDevice: "Add Device",
        saveChanges: "Save Changes",
        deleteDeviceBtn: "Delete Device",
        locationOptional: "Location (Optional)",
        ipOptional: "IP Address (Optional)",
        
        // Device Actions
        editDevice: "Edit Device",
        deleteDevice: "Delete Device",
        confirmDelete: "Delete Confirmation",
        deleteMessage: "Are you sure you want to delete this device?",
        deleteWarning: "This action cannot be undone.",
        
        // IoT Connection
        iotConnection: "IoT Connection Settings",
        esp32IpDefault: "ESP32 Default IP Address",
        esp32IpDesc: "Default IP address for new ESP32",
        websocketPort: "WebSocket Port",
        websocketPortDesc: "WebSocket port for real-time communication (default: 81)",
        
        // General Settings
        generalSettings: "General Settings",
        darkMode: "Dark Mode",
        darkModeDesc: "Enable dark theme to reduce eye strain",
        language: "System Language",
        languageDesc: "Choose your preferred language",
        timezone: "Time Zone",
        timezoneDesc: "Set your time zone according to your location",
        
        // Languages
        indonesian: "Bahasa Indonesia",
        english: "English",
        
        // Timezones
        wib: "WIB (GMT+7)",
        wita: "WITA (GMT+8)",
        wit: "WIT (GMT+9)",
        
        // Sensor Settings
        sensorSettings: "Sensor Settings",
        sensorInterval: "Sensor Reading Interval",
        sensorIntervalDesc: "How often sensors read data (seconds)",
        autoCalibration: "Auto Calibration",
        autoCalibrationDesc: "Enable automatic sensor calibration daily",
        
        // Threshold Settings
        thresholdSettings: "Threshold Settings",
        autoWateringThreshold: "Auto Watering Threshold",
        thresholdInfo: "Set soil moisture limits to control automatic watering. Pump will turn ON when moisture is below dry threshold, and turn OFF when moisture reaches wet threshold.",
        humidityThreshold: "Humidity Threshold",
        humidityDry: "Dry Threshold",
        humidityDryDesc: "Pump turns on when soil moisture is below this value",
        humidityWet: "Wet Threshold",
        humidityWetDesc: "Pump turns off when soil moisture reaches this value",
        phThreshold: "pH Threshold",
        phThresholdTitle: "Soil pH Threshold",
        phAcidic: "Acidic Limit",
        phAcidicDesc: "Alert when soil pH is below this value (too acidic)",
        phAlkaline: "Alkaline Limit",
        phAlkalineDesc: "Alert when soil pH is above this value (too alkaline)",
        zoneDry: "Dry",
        zoneOptimal: "Optimal",
        zoneWet: "Wet",
        
        // Notification Settings
        notificationSettings: "Notification Settings",
        emailNotification: "Email Notifications",
        emailNotificationDesc: "Receive important notifications via email",
        pushNotification: "Push Notifications",
        pushNotificationDesc: "Receive push notifications in browser when there are alerts",
        
        // Security Settings
        securitySettings: "Security Settings",
        twoFactor: "Two-Factor Authentication",
        twoFactorDesc: "Enhance security with two-step verification",
        sessionTimeout: "Session Timeout",
        sessionTimeoutDesc: "Auto logout time when inactive",
        minutes: "Minutes",
        hour: "Hour",
        hours: "Hours",
        
        // Buttons
        saveSettings: "Save Settings",
        exportSettings: "Export Settings",
        resetSettings: "Reset to Default",
        
        // Messages
        settingsSaved: "Settings saved successfully!",
        settingsExported: "Settings exported successfully!",
        settingsReset: "Settings reset to default successfully!",
        confirmReset: "Are you sure you want to reset all settings to default?",
        testConnection: "Test Connection",
        connectionSuccess: "ESP32 connected!",
        connectionFailed: "Connection failed",
        
        // Language change notification
        languageChanged: "Language successfully changed to English"
    },

    // ==========================================
    // LOGIN PAGE
    // ==========================================
    login: {
        title: "PlantCare - Login & Register",
        loginTitle: "Sign in to PlantCare",
        loginSubtitle: "Manage your beloved plants",
        registerTitle: "Join PlantCare",
        registerSubtitle: "Start your gardening journey today",
        
        // Form Fields
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        fullName: "Full Name",
        rememberMe: "Remember me",
        forgotPassword: "Forgot password?",
        
        // Buttons
        loginButton: "Sign In",
        registerButton: "Register Now",
        
        // Switch Forms
        noAccount: "Don't have an account?",
        registerNow: "Register Now",
        hasAccount: "Already have an account?",
        loginHere: "Sign In Here",
        
        // Terms
        agreeTerms: "I agree to the",
        termsConditions: "Terms & Conditions",
        
        // Messages
        loginSuccess: "Login successful!",
        loginFailed: "Invalid email or password!",
        registerSuccess: "Registration successful!",
        registerFailed: "Registration failed!",
        passwordMismatch: "Passwords do not match!",
        emailRequired: "Email is required!",
        passwordRequired: "Password is required!",
        nameRequired: "Full name is required!",
        passwordMinLength: "Password must be at least 6 characters!",
        emailExists: "Email already registered!",
        agreeTermsRequired: "You must agree to the terms & conditions!",
        processing: "Processing..."
    },

    // ==========================================
    // NOTIFICATIONS (Toast messages)
    // ==========================================
    notifications: {
        deviceAdded: "Device added successfully!",
        deviceUpdated: "Device updated successfully!",
        deviceDeleted: "Device deleted successfully!",
        deviceIdRequired: "Device ID must be 12 characters",
        deviceIdHexOnly: "Device ID can only contain hex characters (0-9, A-F)",
        deviceNameRequired: "Device name is required",
        deviceAlreadyExists: "Device ID already registered",
        userIdCopied: "User ID copied successfully!",
        settingsSaved: "Settings saved successfully!",
        settingsFailed: "Failed to save settings!",
        connectionTesting: "Testing connection to",
        connectionSuccess: "Connection successful!",
        connectionFailed: "Connection failed!",
        connectionTimeout: "Timeout: ESP32 not responding"
    },

    // ==========================================
    // PROFILE PAGE
    // ==========================================
    profile: {
        title: "My Profile",
        subtitle: "Manage Your Account Information",
        
        // Profile Header
        userId: "ID",
        copyUserId: "Copy User ID",
        userIdCopied: "User ID successfully copied!",
        farmer: "Farmer",
        researcher: "Researcher",
        student: "Student",
        hobbyist: "Hobbyist",
        
        // Form Labels
        fullName: "Full Name",
        email: "Email",
        phone: "Phone Number",
        birthplace: "Place of Birth",
        birthdate: "Date of Birth",
        farmingField: "Farming Field",
        address: "Farm/Land Address",
        memberSince: "Member Since",
        
        // Form Placeholders
        fullNamePlaceholder: "Enter your full name",
        emailPlaceholder: "example@email.com",
        phonePlaceholder: "08xxxxxxxxxx",
        birthplacePlaceholder: "City of birth",
        addressPlaceholder: "Enter complete address of your farm or agricultural land",
        customFieldPlaceholder: "Specify your farming field",
        
        // Form Hints
        emailHint: "Email cannot be changed",
        phoneHint: "Example: 081234567890",
        addressHint: "Your farm location address (optional)",
        
        // Farming Fields
        chili: "Chili",
        tomato: "Tomato",
        eggplant: "Eggplant",
        rice: "Rice",
        corn: "Corn",
        vegetables: "Vegetables",
        fruits: "Fruits",
        others: "Others",
        
        // Buttons
        editProfile: "Edit Profile",
        saveChanges: "Save Changes",
        cancel: "Cancel",
        changePassword: "Change Password",
        
        // Stats Card
        statsTitle: "Account Statistics",
        daysJoined: "Days Joined",
        farmingFields: "Farming Fields",
        accountStatus: "Account Status",
        active: "Active",
        
        // Quick Actions
        quickActionsTitle: "Quick Actions",
        dashboard: "Dashboard",
        control: "Control",
        settings: "Settings",
        
        // Change Password Modal
        changePasswordTitle: "Change Password",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmNewPassword: "Confirm New Password",
        
        // Messages
        profileUpdated: "Profile successfully updated!",
        profileUpdateFailed: "An error occurred while updating profile",
        passwordChanged: "Password successfully changed!",
        passwordChangeFailed: "Failed to change password",
        passwordMismatch: "New passwords do not match",
        passwordTooShort: "Password must be at least 8 characters",
        currentPasswordWrong: "Current password is incorrect",
        
        // Validation
        nameRequired: "Full name is required",
        emailRequired: "Email is required",
        emailInvalid: "Invalid email format",
        
        // Profile Badge
        fieldLabel: "Field:"
    },

    // ==========================================
    // AUTH PAGES (Login, Register, CompleteProfile)
    // ==========================================
    auth: {
        // Login
        loginTitle: "AgriSmart",
        loginSubtitle: "Sign in to Smart Farming Dashboard",
        email: "Email",
        password: "Password",
        emailPlaceholder: "example@email.com",
        passwordPlaceholder: "Enter your password",
        rememberMe: "Remember me",
        forgotPassword: "Forgot password?",
        loginButton: "Sign In",
        orDivider: "or",
        googleLogin: "Sign in with Google",
        noAccount: "Don't have an account?",
        registerNow: "Register Now",
        
        // Register
        registerTitle: "AgriSmart",
        registerSubtitle: "Join Smart Farming",
        fullName: "Full Name",
        fullNamePlaceholder: "Enter your full name",
        phone: "Phone Number",
        phonePlaceholder: "08xxxxxxxxxx",
        phoneHint: "Example: 081234567890",
        birthplace: "Place of Birth",
        birthplacePlaceholder: "City of birth",
        birthdate: "Date of Birth",
        farmingField: "What is Your Farming Field?",
        address: "Farm/Land Address (Optional)",
        addressPlaceholder: "Your farm location address",
        confirmPassword: "Confirm Password",
        confirmPasswordPlaceholder: "Re-enter password",
        passwordMinimal: "Minimum 8 characters",
        passwordHint: "Use at least 8 characters with letters and numbers",
        agreeTerms: "I agree to the",
        termsAndConditions: "Terms & Conditions",
        registerButton: "Register Now",
        haveAccount: "Already have an account?",
        loginHere: "Sign In Here",
        
        // Complete Profile
        completeProfileTitle: "AgriSmart",
        completeProfileSubtitle: "Complete Your Data to Start Smart Farming",
        googleBadge: "Google",
        customFieldPlaceholder: "Specify your farming field",
        saveAndContinue: "Save & Continue",
        useAnotherAccount: "Want to use another account?",
        logout: "Logout",
        
        // Farming Fields
        chili: "Chili",
        tomato: "Tomato",
        eggplant: "Eggplant",
        rice: "Rice",
        corn: "Corn",
        vegetables: "Vegetables",
        fruits: "Fruits",
        others: "Others",
        
        // Common
        required: "*",
        
        // Messages
        loginSuccess: "Login successful! Redirecting...",
        loginError: "Invalid email or password",
        registerSuccess: "Registration successful!",
        registerError: "An error occurred during registration",
        profileCompleteSuccess: "Profile completed successfully!",
        profileCompleteError: "An error occurred",
        passwordMismatch: "Passwords do not match",
        fillAllFields: "Please fill all required fields",
        agreeTermsRequired: "You must agree to the terms & conditions",
        
        // Success Modal (Register)
        congratulations: "Congratulations!",
        registrationComplete: "Registration Successful",
        accountCreated: "Your account has been successfully created",
        yourInfo: "Your Information:",
        name: "Name",
        proceedToDashboard: "Go to Dashboard",
        
        // Password Strength
        passwordWeak: "Weak",
        passwordMedium: "Medium",
        passwordStrong: "Strong"
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = lang_en;
}