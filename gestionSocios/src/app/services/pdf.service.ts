import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  generarReciboPago(datos: {
    persona: string;
    descripcion: string;
    monto: number;
    fecha?: string;
  }) {
    const fechaActual = datos.fecha || new Date().toLocaleDateString('es-AR');

    this.loadImage('images/escudo.png').then(logoDataUrl => {
      this.generarPDF(datos, fechaActual, logoDataUrl);
    }).catch(() => {
      this.generarPDF(datos, fechaActual, null);
    });
  }

  private loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject('Canvas context error');
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = reject;
      img.src = url;
    });
  }

  private generarPDF(datos: any, fechaActual: string, logoDataUrl: string | null) {
    const doc = new jsPDF();

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', 20, 15, 35, 35);
      } catch (error) {
        console.error('Error al agregar logo:', error);
      }
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CLUB ATLETICO AYACUCHO', 105, 25, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('(SOCIEDAD JURIDICA)', 105, 32, { align: 'center' });
    doc.text('DEPORTIVO Y SOCIAL', 105, 37, { align: 'center' });
    doc.text('BME. MITRE 1026/34/42', 105, 42, { align: 'center' });
    doc.text('(7150) AYACUCHO - BS. AS.', 105, 47, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('FUNDADO EN 1918', 105, 57, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(20, 60, 190, 60);

    doc.setFontSize(10);
    doc.text(`Fecha: ${fechaActual}`, 190, 68, { align: 'right' });

    const montoFormateado = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(datos.monto);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const frasePrincipal = `Paguese a ${datos.persona} la cantidad de pesos ${montoFormateado} en razón de ${datos.descripcion}`;
    const lineasFrase = doc.splitTextToSize(frasePrincipal, 170);
    
    let yPos = 85;
    lineasFrase.forEach((linea: string) => {
      doc.text(linea, 20, yPos);
      yPos += 7;
    });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Son ${montoFormateado}`, 190, yPos + 15, { align: 'right' });

    doc.save(`recibo-${datos.persona.replace(/\s+/g, '-')}.pdf`);
  }
}
