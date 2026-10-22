package mx.tecnm.oaxaca.coordinatec.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Permite CORS en todas las rutas bajo /api/
                .allowedOriginPatterns("*") // Permite cualquier origen (React en localhost:3000, Vite en localhost:5173, etc.)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS") // Métodos HTTP permitidos
                .allowedHeaders("*") // Permite todos los encabezados (incluyendo Authorization para el JWT)
                .allowCredentials(true); // Permite el envío de cookies y credenciales si se requieren
    }
}