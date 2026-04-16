package com.ecommerce.userservice.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Custom JWT converter that extracts roles from cognito:groups claim
 * Converts Cognito groups to Spring Security authorities
 */
@Component
public class JwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final JwtGrantedAuthoritiesConverter defaultConverter = new JwtGrantedAuthoritiesConverter();

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        // Get default authorities (scope-based)
        Collection<GrantedAuthority> authorities = defaultConverter.convert(jwt);

        // Extract Cognito groups as roles
        List<String> cognito_groups = jwt.getClaimAsStringList("cognito:groups");
        if (cognito_groups != null) {
            Stream<GrantedAuthority> groupAuthorities = cognito_groups.stream()
                .map(group -> new SimpleGrantedAuthority("ROLE_" + group));
            authorities = Stream.concat(authorities.stream(), groupAuthorities)
                .collect(Collectors.toSet());
        }

        // Create authentication token
        String principalClaimValue = jwt.getClaimAsString("sub");
        return new JwtAuthenticationToken(jwt, authorities, principalClaimValue);
    }
}
