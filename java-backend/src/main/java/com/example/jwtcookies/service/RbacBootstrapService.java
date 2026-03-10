package com.example.jwtcookies.service;

import com.example.jwtcookies.model.Permission;
import com.example.jwtcookies.model.Role;
import com.example.jwtcookies.repository.PermissionRepository;
import com.example.jwtcookies.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Component
public class RbacBootstrapService implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(RbacBootstrapService.class);

    private static final List<String> ALL_PERMISSION_KEYS = List.of(
            "CLIENT_READ",
            "CLIENT_CREATE",
            "CLIENT_UPDATE",
            "CLIENT_DELETE",
            "PRODUCT_READ",
            "PRODUCT_CREATE",
            "PRODUCT_UPDATE",
            "PRODUCT_DELETE",
            "ROLE_READ",
            "ROLE_CREATE",
            "ROLE_UPDATE",
            "ROLE_DELETE"
    );

    private static final Map<String, List<String>> ROLE_PERMISSIONS = Map.of(
            "end-user", List.of(
                    "CLIENT_READ",
                    "CLIENT_CREATE",
                    "CLIENT_UPDATE",
                    "CLIENT_DELETE",
                    "PRODUCT_READ",
                    "PRODUCT_CREATE",
                    "PRODUCT_UPDATE",
                    "PRODUCT_DELETE"
            ),
            "admin", List.of(
                    "CLIENT_READ",
                    "CLIENT_CREATE",
                    "CLIENT_UPDATE",
                    "CLIENT_DELETE",
                    "PRODUCT_READ",
                    "PRODUCT_CREATE",
                    "PRODUCT_UPDATE",
                    "PRODUCT_DELETE"
            ),
            "super-admin", ALL_PERMISSION_KEYS
    );

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    public RbacBootstrapService(PermissionRepository permissionRepository, RoleRepository roleRepository) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        ensureRbac();
    }

    public void ensureRbac() {
        Map<String, String> permissionIdsByKey = new HashMap<>();

        for (String key : ALL_PERMISSION_KEYS) {
            Permission permission = permissionRepository.findByKey(key).orElseGet(() -> {
                Permission created = new Permission();
                created.setKey(key);
                return permissionRepository.save(created);
            });
            permissionIdsByKey.put(key, permission.getId());
        }

        for (Map.Entry<String, List<String>> entry : ROLE_PERMISSIONS.entrySet()) {
            String roleName = entry.getKey();
            List<String> permissionKeys = entry.getValue();

            Role role = roleRepository.findByName(roleName).orElseGet(Role::new);
            role.setName(roleName);
            role.setPermissions(permissionKeys.stream()
                    .map(permissionIdsByKey::get)
                    .filter(Objects::nonNull)
                    .toList());

            if ("super-admin".equals(roleName)) {
                role.setIsSystemRole(true);
            } else if (role.getIsSystemRole() == null) {
                role.setIsSystemRole(false);
            }

            roleRepository.save(role);
        }

        LOGGER.info("RBAC bootstrap complete");
    }
}
