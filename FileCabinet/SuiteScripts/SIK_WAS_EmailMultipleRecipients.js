/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/record', 'N/log', 'N/search'],

function(record, log, search) {

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {

      var transRec = scriptContext.newRecord;
      var entity = transRec.getValue({fieldId:'entity'});
      var contacts = searchContacts(entity);


      try{
        var contactString = contacts.toString();
        log.debug({title:'contactString',details:contactString});
        transRec.setValue({fieldId:'email',value:contactString,ignoreFieldChange:true});
      }
      catch(err){
        log.debug({title:'error',details:err});
      }


    }


    function searchContacts(entity){

      var contacts = [];
      var contactSearch = search.create({
    		   type: "contact",
    		   filters:
    		   [
    		      ["company","anyof",entity],
              "AND",
              ["custentity_sik_billing_contact","is","T"]
    		   ],
    		   columns:
    		   [
    		      search.createColumn({name: "email", label: "Email"}),
              search.createColumn({name: "internalid", label: "Internal ID"}),
    		   ]
    		});
    		var searchResultCount = contactSearch.runPaged().count;
    		log.debug("contactSearch result count",searchResultCount);


        if(searchResultCount > 0){
          contactSearch.run().each(function(result){
      		   // .run().each has a limit of 4,000 results

      			var contactId = result.getValue({name: "internalid"});
            var email = result.getValue({name: "email"});
            contacts.push(email);

      		  return true;
      		});

          return contacts;

        }

    }

    return {
        onAction : onAction
    };

});
