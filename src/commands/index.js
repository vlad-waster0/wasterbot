import { menuCommand, aluguelBotCommand, menu1Command, menu2Command, menu3Command, menu4Command, menu5Command, menu6Command, menuoriginalCommand, mudarMenu1Command, mudarMenu2Command, mudarMenu3Command, mudarMenu4Command, mudarMenu5Command, mudarMenu6Command, editarEmojiCommand, editarMenuAdmCommand, editarMenuDonoCommand } from './menu.js'
import { funCommands } from './fun.js'
import { mediaCommands } from './media.js'
import { musicCommands } from './music.js'
import { groupCommands, addCommand, muteCommand, unmuteCommand, reportCommand, removeReportCommand } from "./groups.js"
import { groupSettingsCommands } from './groups.js'
import { ativarSaidaCommand, desativarSaidaCommand } from './groups.js'
import { adminMenuCommand, ativarGoldDiarioCommand, desativarGoldDiarioCommand, afkCommand, afkMotivoCommand, desativarAfkCommand } from './admin.js'
import { goldCommands } from './gold.js'
import { warningCommands } from './warnings.js'
import { blacklistCommands } from './blacklist.js'
import { antilinkCommands } from './antilink.js'
import { antifloodCommands } from './antiflood.js'
import { jogosNovosCommands } from './jogos_novos.js'
import { antipalavraCommands } from './antipalavra.js'
import { linkGrupoCommand } from './linkgrupo.js'
import { welcomeCommands } from './welcome.js'
import { perfilCommands } from './perfil.js'
import { relacionamentoCommands } from './relacionamento.js'
import { relacionamentoConfigCommands } from './relacionamento.js'
import { ownerCommands } from './owner.js'
import { gifCommands } from './gifs.js'
import { brincadeirasCommands } from './brincadeiras.js'
import { menuBrincadeirasCommand } from './brincadeiras.js'
import { jogos2Commands } from './jogos2.js'
import { lojaCommands } from './loja.js'
import { downloadsCommands } from './downloads.js'
import { atividadeCommands } from './atividade.js'
import { adminGoldCommands } from './gold.js'
import { regrasCommands } from './regras.js'
import { horarioGrupoCommands } from './horariogrupo.js'
import { patenteFFCommands } from './patenteff.js'
import { configPatenteFFCommand } from './patenteff.js'
import { edicaoPatenteFFCommands } from './patenteff.js'
import { menuGoldCommand } from './gold.js'
import { rankingCommand } from './ranking.js'
import { levelCommand } from './level.js'

export const commands = [
  menuCommand,
  aluguelBotCommand,
  ...funCommands,
  ...jogos2Commands,
  ...lojaCommands,
  ...downloadsCommands,
  ...mediaCommands,
  ...musicCommands,
  ...groupCommands, addCommand, muteCommand, unmuteCommand, reportCommand, removeReportCommand, ...groupSettingsCommands,
  ativarSaidaCommand,
  desativarSaidaCommand,
  ...goldCommands,
  ...adminGoldCommands,
  menuGoldCommand,
  ...warningCommands,
  ...blacklistCommands,
  linkGrupoCommand,
  ...antilinkCommands,
  ...antifloodCommands,
  
  ...jogosNovosCommands,
  ...antipalavraCommands,
  ...welcomeCommands,
  ...perfilCommands,
  ...relacionamentoCommands,
  ...relacionamentoConfigCommands,
  ...ownerCommands,
  ...gifCommands,
  ...brincadeirasCommands,
  menuBrincadeirasCommand,
  ...atividadeCommands,
  ...regrasCommands,
  ...horarioGrupoCommands,
  ...patenteFFCommands,
  configPatenteFFCommand,
  ...edicaoPatenteFFCommands,
  adminMenuCommand,
  ativarGoldDiarioCommand,
  desativarGoldDiarioCommand,
  afkCommand,
  afkMotivoCommand,
  desativarAfkCommand,
  menu1Command,
  menu2Command,
  menu3Command,
  menu4Command,
  menu5Command,
  menu6Command,
  menuoriginalCommand,
  mudarMenu1Command,
  mudarMenu2Command,
  mudarMenu3Command,
  mudarMenu4Command,
  mudarMenu5Command,
  mudarMenu6Command,
  editarEmojiCommand,
  editarMenuAdmCommand,
  editarMenuDonoCommand

]

export const commandMap = new Map(
  commands.flatMap((command) => {
    return [command.name, ...(command.aliases || [])].map((name) => [
      name,
      command,
    ])
  })
)


