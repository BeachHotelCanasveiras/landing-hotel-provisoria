/**
 * @file types.ts
 * @description Contratos de datos estrictos para el módulo de Atracciones.
 * Resuelve las advertencias de ESLint v9 eliminando la necesidad de 'any'.
 */

export interface AttractionConfig {
  id: number;
  key: string;
  image: string;
}

export interface AttractionTranslation {
  name: string;
  description: string;
  distance: string;
  time: string;
}

export interface MappedAttraction extends AttractionConfig {
  name: string;
  description: string;
  distance: string;
  time: string;
}