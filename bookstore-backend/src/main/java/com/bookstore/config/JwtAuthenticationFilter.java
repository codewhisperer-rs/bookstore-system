package com.bookstore.config;

import com.bookstore.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        // Skip JWT processing for public endpoints
        String requestPath = request.getRequestURI();
        if (requestPath.startsWith("/api/auth/") || 
            requestPath.startsWith("/api/books/") || 
            requestPath.startsWith("/swagger-ui/") || 
            requestPath.startsWith("/v3/api-docs/") || 
            requestPath.startsWith("/h2-console/") || 
            requestPath.startsWith("/api/test/")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        final String authorizationHeader = request.getHeader("Authorization");
        
        String username = null;
        String jwt = null;
        
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            log.debug("JWT token found: {}", jwt.substring(0, Math.min(jwt.length(), 20)) + "...");
            try {
                username = jwtUtil.extractUsername(jwt);
                log.debug("Extracted username: {}", username);
            } catch (Exception e) {
                log.error("JWT token extraction failed for token: {}", jwt.substring(0, Math.min(jwt.length(), 20)) + "...", e);
            }
        } else {
            log.debug("No Authorization header found or invalid format. Header: {}", authorizationHeader);
        }
        
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                log.debug("User details loaded for username: {}", username);
                
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(
                            userDetails, 
                            null, 
                            userDetails.getAuthorities()
                        );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("Authentication successful for user: {}", username);
                } else {
                    log.warn("JWT token validation failed for user: {}", username);
                }
            } catch (Exception e) {
                log.error("Error during authentication for user: {}", username, e);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
