package mx.tecnm.oaxaca.coordinatec.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtService jwtService) {
        this.jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtService);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Deshabilitar CSRF para pruebas de API REST
            .csrf(csrf -> csrf.disable())
            // Configurar CORS dentro de Spring Security
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(WebConfig.ALLOWED_ORIGINS);
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                return config;
            }))
            .sessionManagement(session -> session.sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.STATELESS))
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/error", "/api/v1/auth/login", "/api/v1/estudiantes/registro", "/api/v1/estudiantes/sesion", "/api/v1/estudiantes/carreras", "/api/v1/estudiantes/recuperacion/**", "/api/v1/coordinadores/departamentos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/tramites/**", "/api/v1/coordinadores/*/disponibilidad").permitAll()
                .requestMatchers("/api/v1/estudiantes/**", "/api/v1/citas/estudiantes/**").hasRole("ESTUDIANTE")
                .requestMatchers("/api/v1/catalogos/**").hasAnyRole("ESTUDIANTE", "COORDINADOR", "JEFE_COORDINADORES")
                .requestMatchers("/api/v1/jefe-coordinadores/**").hasRole("JEFE_COORDINADORES")
                .requestMatchers("/api/v1/carrera-tramites/**").hasAnyRole("COORDINADOR", "JEFE_COORDINADORES")
                .requestMatchers("/api/v1/citas/coordinador/**").hasAnyRole("COORDINADOR", "JEFE_COORDINADORES")
                .requestMatchers(HttpMethod.GET, "/api/v1/citas").hasRole("JEFE_COORDINADORES")
                .requestMatchers(HttpMethod.GET, "/api/v1/citas/*").hasAnyRole("ESTUDIANTE", "COORDINADOR", "JEFE_COORDINADORES")
                .requestMatchers(HttpMethod.POST, "/api/v1/citas").hasAnyRole("ESTUDIANTE", "COORDINADOR", "JEFE_COORDINADORES")
                .requestMatchers(HttpMethod.PUT, "/api/v1/citas/*").hasRole("JEFE_COORDINADORES")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/citas/*").hasRole("JEFE_COORDINADORES")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/citas/*/estado").hasAnyRole("COORDINADOR", "JEFE_COORDINADORES")
                .requestMatchers(HttpMethod.POST, "/api/v1/tramites/**").hasAnyRole("COORDINADOR", "JEFE_COORDINADORES")
                .requestMatchers(HttpMethod.PUT, "/api/v1/tramites/**").hasAnyRole("COORDINADOR", "JEFE_COORDINADORES")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/tramites/**").hasAnyRole("COORDINADOR", "JEFE_COORDINADORES")
                .requestMatchers("/api/v1/coordinadores/*/horarios").hasAnyRole("ESTUDIANTE", "COORDINADOR", "JEFE_COORDINADORES")
                .requestMatchers("/api/v1/auth/me").authenticated()
                .anyRequest().denyAll()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
