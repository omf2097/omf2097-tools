#ifndef _ANIMATION_MISC_H
#define _ANIMATION_MISC_H

#include <shadowdive/shadowdive.h>

int sprite_key_get_id(const char* key);
void sprite_set_key(sd_sprite *s, const char **key, int kcount, const char *value);
void sprite_get_key(sd_sprite *s, const char **key, int kcount);
void sprite_keylist();
void sprite_info(sd_sprite *s, int anim, int sprite);

void sprite_export_key(sd_sprite *s, const char **key, int kcount, const char *filename, sd_bk_file *bk);
void sprite_import_key(sd_sprite *s, const char **key, int kcount, const char *filename, int transparent_index);

void anim_common_info(sd_animation *ani);
int anim_key_get_id(const char* key);
void anim_get_key(sd_animation *ani, int kn, const char **key, int kcount, int pcount);
void anim_set_key(sd_animation *ani, int kn, const char **key, int kcount, const char *value);
void anim_keylist();

void string_strip(char *str, const char *tag);
void anim_strip_key(sd_animation *ani, int kn, const char **key, int kcount, const char *tag);

void anim_push(sd_animation *ani);
void anim_pop(sd_animation *ani);

#endif // _ANIMATION_MISC_H
