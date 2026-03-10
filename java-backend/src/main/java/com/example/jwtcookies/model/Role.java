package com.example.jwtcookies.model;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "roles")
public class Role extends BaseDocument {

    @Indexed(unique = true)
    private String name;

    private List<String> permissions = new ArrayList<>();

    @Field("isSystemRole")
    private Boolean isSystemRole = false;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<String> permissions) {
        this.permissions = permissions;
    }

    public Boolean getIsSystemRole() {
        return isSystemRole;
    }

    public void setIsSystemRole(Boolean systemRole) {
        isSystemRole = systemRole;
    }
}
