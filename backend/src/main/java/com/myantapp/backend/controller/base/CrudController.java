package com.myantapp.backend.controller.base;

import com.baomidou.mybatisplus.extension.service.IService;
import java.io.Serializable;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

public abstract class CrudController<T, S extends IService<T>> {

    protected abstract S getService();

    @GetMapping("/list")
    public List<T> list() {
        return getService().list();
    }

    @GetMapping("/{id}")
    public T getById(@PathVariable Serializable id) {
        return getService().getById(id);
    }

    @PostMapping
    public boolean save(@Valid @RequestBody T entity) {
        return getService().save(entity);
    }

    @PutMapping
    public boolean update(@Valid @RequestBody T entity) {
        return getService().updateById(entity);
    }

    @DeleteMapping("/{id}")
    public boolean remove(@PathVariable Serializable id) {
        return getService().removeById(id);
    }
}