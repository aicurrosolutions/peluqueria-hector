import { format, addMinutes, parse, isAfter, isBefore } from "date-fns";

type FranjaHoraria = { inicio: string; fin: string };
type HorarioDia = FranjaHoraria[] | null; // null = cerrado

// 0 = domingo, 1 = lunes, ..., 6 = sábado
export const HORARIO_SEMANAL: Record<number, HorarioDia> = {
  0: null, // Domingo - cerrado
  1: [{ inicio: "16:30", fin: "20:30" }], // Lunes
  2: [{ inicio: "10:00", fin: "14:00" }, { inicio: "16:40", fin: "20:00" }], // Martes
  3: [{ inicio: "10:00", fin: "14:00" }, { inicio: "16:40", fin: "20:00" }], // Miércoles
  4: [{ inicio: "10:00", fin: "14:00" }, { inicio: "16:30", fin: "20:00" }], // Jueves
  5: [{ inicio: "10:00", fin: "13:30" }, { inicio: "15:30", fin: "20:00" }], // Viernes
  6: [{ inicio: "09:30", fin: "13:00" }], // Sábado
};

export function esDiaCerrado(diaSemana: number): boolean {
  return HORARIO_SEMANAL[diaSemana] === null;
}

export function generarSlots(duracionMinutos: number, diaSemana: number): string[] {
  const franjas = HORARIO_SEMANAL[diaSemana];
  if (!franjas) return [];

  const slots: string[] = [];
  const base = new Date(2000, 0, 1);

  for (const franja of franjas) {
    let actual = parse(franja.inicio, "HH:mm", base);
    const limite = parse(franja.fin, "HH:mm", base);
    while (isBefore(actual, limite) || actual.getTime() === limite.getTime()) {
      const siguiente = addMinutes(actual, duracionMinutos);
      if (isAfter(siguiente, limite) && siguiente.getTime() !== limite.getTime()) break;
      slots.push(format(actual, "HH:mm"));
      actual = addMinutes(actual, 30); // intervalos de 30 min
    }
  }

  return slots;
}

export function formatearDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
