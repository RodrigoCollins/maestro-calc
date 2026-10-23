import { globSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot, importFromRoot } from './root.ts';
import { catalogRegisterProblems, registerProblems } from './register.ts';

describe('Spanish register (i18n-catalog › Neutral tú register, no voseo)', () => {
  // spec: i18n-catalog › [ICW5]
  it.each(['Ingrese', 'Elija', 'Utilice', 'Consulte', 'Contáctenos', 'Póngase', 'Verifique'])(
    'flags the formal imperative %s',
    (form) => {
      expect(registerProblems(`${form} los datos de la obra.`)).toEqual([form]);
    },
  );

  // spec: i18n-catalog › [ICW9]
  it.each(['verificá', 'calculá', 'consultá', 'elegí', 'tenés', 'podés', 'querés', 'sabés'])(
    'flags the voseo form %s',
    (form) => {
      expect(registerProblems(`Si ${form} algo, avisa.`)).toEqual([form]);
    },
  );

  it('matches whole words and ignores case', () => {
    expect(registerProblems('VERIFICÁ el total')).toEqual(['VERIFICÁ']);
    expect(registerProblems('ingrese un valor')).toEqual(['ingrese']);
    // neighbours that must stay legal: infinitives, tú forms and unrelated words
    expect(
      registerProblems('Consultar verifica tienes puedes quieres sabes elige calcula'),
    ).toEqual([]);
    expect(registerProblems('Reingrese y consultemos')).toEqual([]);
  });

  it('reports every offence of a message in reading order', () => {
    expect(registerProblems('Consulte la guía y verificá el total')).toEqual([
      'Consulte',
      'verificá',
    ]);
  });

  it('names the key and the form of an offending catalog entry', () => {
    expect(
      catalogRegisterProblems({
        'x.ok': 'Consulta la guía',
        'x.y': 'Consulte la guía',
        'x.z': 'verificá con un profesional',
      }),
    ).toEqual(['x.y: Consulte', 'x.z: verificá']);
  });

  it('finds none in the real Spanish catalog modules', async () => {
    const files = globSync('packages/i18n/src/catalogs/es/*.ts', { cwd: fromRoot() });
    expect(files.length).toBeGreaterThanOrEqual(3);
    for (const file of files) {
      const exported = Object.values(await importFromRoot<Record<string, object>>(file));
      expect(exported, file).toHaveLength(1);
      expect(catalogRegisterProblems(exported[0] as Record<string, string>), file).toEqual([]);
    }
  });
});
