import { TimeAgoPipe } from "./time-ago-pipe";


describe('TimeAgoPipe', () => {
  let pipe: TimeAgoPipe;
  const baseTime = new Date('2025-12-21T12:00:00Z'); // Fecha fija de referencia

  beforeEach(() => {
    pipe = new TimeAgoPipe();
    jasmine.clock().install();
    jasmine.clock().mockDate(baseTime); // Congelamos el tiempo en baseTime
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('debería retornar cadena vacía para valores nulos o indefinidos', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('debería retornar "Ahora" para menos de 60 segundos', () => {
    const thirtySecondsAgo = new Date(baseTime.getTime() - 30 * 1000);
    expect(pipe.transform(thirtySecondsAgo)).toBe('Ahora');
  });

  it('debería retornar minutos transcurridos ("m")', () => {
    const tenMinutesAgo = new Date(baseTime.getTime() - 10 * 60 * 1000);
    expect(pipe.transform(tenMinutesAgo)).toBe('10m');
  });

  it('debería retornar horas transcurridas ("h")', () => {
    const fiveHoursAgo = new Date(baseTime.getTime() - 5 * 60 * 60 * 1000);
    expect(pipe.transform(fiveHoursAgo)).toBe('5h');
  });

  it('debería retornar días transcurridos ("d")', () => {
    const threeDaysAgo = new Date(baseTime.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(threeDaysAgo)).toBe('3d');
  });

  it('debería retornar semanas transcurridas ("sem")', () => {
    const twoWeeksAgo = new Date(baseTime.getTime() - 14 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(twoWeeksAgo)).toBe('2 sem');
  });

  it('debería retornar fecha corta (dia y mes) para más de un mes en el mismo año', () => {
    // 40 días atrás (estamos en diciembre de 2025, esto cae en noviembre de 2025)
    const fortyDaysAgo = new Date(baseTime.getTime() - 40 * 24 * 60 * 60 * 1000);
    const result = pipe.transform(fortyDaysAgo);
    
    // Nota: toLocaleDateString puede variar levemente segun el entorno (espacios, puntos)
    // Usamos matcher flexible o comprobamos partes
    expect(result).toMatch(/\d+ \w+/); // Ej: "11 nov"
    expect(result).not.toContain('2025');
  });

  it('debería retornar fecha con año para más de un mes en años diferentes pero menos de un año total', () => {
    // Arrange: Seteamos el "Ahora" en 10 de Enero de 2025
    const nowInJanuary = new Date('2025-01-10T12:00:00Z');
    jasmine.clock().mockDate(nowInJanuary);

    // Fecha: 15 de Noviembre de 2024 (Hace ~2 meses, pero es año diferente)
    const diffYearDate = new Date('2024-11-15T12:00:00Z');

    // Act
    const result = pipe.transform(diffYearDate);
    
    // Assert
    // El intervalo es ~0.15 años (no entra en '1a')
    // El intervalo es ~1.8 meses (entra en formato fecha corta)
    // Los años son 2025 vs 2024 (debe incluir el año)
    expect(result).withContext('Debería contener el año 2024 ya que es un año distinto al actual (2025)').toContain('2024');
    expect(result).toMatch(/15/); // Debe contener el día
  });
  it('debería retornar años transcurridos ("a")', () => {
    // 2 años atrás
    const twoYearsAgo = new Date('2023-10-15T12:00:00Z');
    expect(pipe.transform(twoYearsAgo)).toBe('2a');
  });

  it('debería manejar correctamente strings de fecha', () => {
    const oneHourAgo = new Date(baseTime.getTime() - 3600 * 1000).toISOString();
    expect(pipe.transform(oneHourAgo)).toBe('1h');
  });
});