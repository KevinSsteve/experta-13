class WhisperLocalManager {
  private transcriber: any = null;
  private isLoading = false;

  async init(): Promise<void> {
    if (this.transcriber || this.isLoading) return;

    this.isLoading = true;
    try {
      console.log('Carregando modelo Whisper local...');
      const { pipeline } = await import('@huggingface/transformers');
      this.transcriber = await pipeline(
        'automatic-speech-recognition',
        'onnx-community/whisper-tiny',
        {
          device: 'webgpu',
          dtype: 'fp32',
        }
      );
      console.log('Modelo Whisper carregado com sucesso!');
    } catch (error) {
      console.warn('WebGPU não disponível, usando CPU...', error);
      try {
        const { pipeline } = await import('@huggingface/transformers');
        this.transcriber = await pipeline(
          'automatic-speech-recognition',
          'onnx-community/whisper-tiny',
          {
            device: 'cpu',
            dtype: 'fp32',
          }
        );
        console.log('Modelo Whisper carregado com CPU!');
      } catch (cpuError) {
        console.error('Erro ao carregar modelo Whisper:', cpuError);
        throw cpuError;
      }
    } finally {
      this.isLoading = false;
    }
  }

  async transcribe(audioBlob: Blob): Promise<string> {
    if (!this.transcriber) {
      await this.init();
    }

    if (!this.transcriber) {
      throw new Error('Modelo Whisper não foi carregado');
    }

    try {
      console.log('Transcrevendo áudio...');
      
      // Converter Blob para URL para o modelo
      const audioUrl = URL.createObjectURL(audioBlob);
      const result: any = await this.transcriber(audioUrl);
      
      // Cleanup
      URL.revokeObjectURL(audioUrl);
      
      console.log('Transcrição concluída:', result);
      return Array.isArray(result) ? result[0]?.text || '' : result?.text || '';
    } catch (error) {
      console.error('Erro na transcrição:', error);
      throw error;
    }
  }

  isModelLoaded(): boolean {
    return this.transcriber !== null;
  }

  isModelLoading(): boolean {
    return this.isLoading;
  }
}

export const whisperLocal = new WhisperLocalManager();