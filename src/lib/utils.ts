import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeExchange(time: string | number) {
  return new Date(Number(time)).toLocaleString().replaceAll('/', '-');
}

export function randomTwentyFive() {
  return Math.floor(Math.random() * 25);
}