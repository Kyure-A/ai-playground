import * as kuromoji from "kuromoji";
import * as path from "path";

// 形態素解析器のインターフェース
export interface MorphologicalAnalyzer {
  analyze(text: string): Promise<{ hasDesire: boolean; isNegative: boolean }>;
  extractDesire(text: string): Promise<string | null>;
}

// 欲求表現を検出するクラス
export class JapaneseMorphologicalAnalyzer implements MorphologicalAnalyzer {
  private tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initTokenizer();
  }

  // 形態素解析器の初期化
  private initTokenizer(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise<void>((resolve, reject) => {
      // kuromojiの辞書パスを設定
      const dicPath = path.resolve(
        process.cwd(),
        "node_modules/kuromoji/dict"
      );

      kuromoji
        .builder({ dicPath })
        .build((err, tokenizer) => {
          if (err) {
            console.error("形態素解析器の初期化エラー:", err);
            reject(err);
            return;
          }

          this.tokenizer = tokenizer;
          this.initialized = true;
          resolve();
        });
    });

    return this.initPromise;
  }

  // テキストに欲求表現が含まれているかを分析し、肯定/否定を判定
  async analyze(text: string): Promise<{ hasDesire: boolean; isNegative: boolean }> {
    await this.ensureInitialized();
    
    if (!this.tokenizer) {
      return { hasDesire: false, isNegative: false };
    }

    const tokens = this.tokenizer.tokenize(text);
    let hasDesire = false;
    let isNegative = false;
    
    // 「たい」を含む動詞や形容詞を探す
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      // 「たい」で終わる助動詞を検出
      if (token.pos === "助動詞" && token.surface_form === "たい") {
        hasDesire = true;
        
        // 後ろに否定表現があるか確認
        if (i < tokens.length - 1) {
          const nextToken = tokens[i + 1];
          if (
            (nextToken.pos === "助動詞" && nextToken.surface_form === "ない") ||
            (nextToken.pos === "形容詞" && nextToken.basic_form === "ない") ||
            (nextToken.pos_detail_1 === "否定助動詞")
          ) {
            isNegative = true;
          }
        }
      }
      
      // 「たい」を含む動詞や形容詞を検出
      if ((token.pos === "動詞" || token.pos === "形容詞") && token.surface_form.endsWith("たい")) {
        hasDesire = true;
        
        // 後ろに否定表現があるか確認
        if (i < tokens.length - 1) {
          const nextToken = tokens[i + 1];
          if (
            (nextToken.pos === "助動詞" && nextToken.surface_form === "ない") ||
            (nextToken.pos === "形容詞" && nextToken.basic_form === "ない") ||
            (nextToken.pos_detail_1 === "否定助動詞")
          ) {
            isNegative = true;
          }
        }
      }
      
      // 「たくない」のような形式を検出
      if (
        (token.pos === "形容詞" && token.surface_form.includes("たくない")) ||
        (token.pos === "助動詞" && token.surface_form === "たく" && i < tokens.length - 1 && 
         tokens[i + 1].surface_form === "ない")
      ) {
        hasDesire = true;
        isNegative = true;
      }
    }

    return { hasDesire, isNegative };
  }

  // 欲求表現から動詞部分を抽出（肯定・否定両方対応）
  async extractDesire(text: string): Promise<string | null> {
    await this.ensureInitialized();
    
    if (!this.tokenizer) {
      return null;
    }

    const tokens = this.tokenizer.tokenize(text);
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      // 「たい」で終わる助動詞を検出した場合、前の動詞を取得
      if (token.pos === "助動詞" && 
          (token.surface_form === "たい" || token.surface_form === "たく") && 
          i > 0) {
        // 前のトークンが動詞の場合
        if (tokens[i-1].pos === "動詞") {
          // 動詞の基本形を取得
          const verb = tokens[i-1].basic_form;
          return verb;
        }
      }
      
      // 「たい」「たくない」を含む動詞や形容詞を検出
      if ((token.pos === "動詞" || token.pos === "形容詞") && 
          (token.surface_form.endsWith("たい") || token.surface_form.includes("たくな"))) {
        // 「たい」「たくな」を除いた基本形を返す
        const base = token.basic_form.replace(/たい$/, "").replace(/たくな.*$/, "");
        return base;
      }
    }

    return null;
  }

  // 初期化を確認
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initTokenizer();
    }
  }
}
